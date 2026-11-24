import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// Fonts available for new / replaced text. Each maps to a PDF standard font (no embedding
// needed) and a similar-looking browser font for the on-screen preview. `baseline` is where the
// baseline sits inside a CSS line box of LINE_HEIGHT, as a fraction of the font size, so the
// preview and the exported PDF line up.
export const LINE_HEIGHT = 1.2
export const FONTS = {
  sans: { label: 'Sans', css: 'Helvetica, Arial, sans-serif', baseline: 0.947, std: [StandardFonts.Helvetica, StandardFonts.HelveticaBold] },
  serif: { label: 'Serif', css: '"Times New Roman", Times, serif', baseline: 0.938, std: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold] },
  mono: { label: 'Mono', css: '"Courier New", Courier, monospace', baseline: 0.866, std: [StandardFonts.Courier, StandardFonts.CourierBold] },
}

/** Opens a PDF with pdf.js and returns its pages' sizes at scale 1 (1 unit = 1 PDF point). */
export async function loadPdf(bytes) {
  // pdf.js transfers the buffer to its worker, so hand it a copy and keep the original for export.
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
  const pages = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    pages.push({ index: i - 1, width: viewport.width, height: viewport.height, rotation: page.rotate, viewport })
  }
  return { doc, pages }
}

/** Horizontal text runs on a page, positioned in scale-1 viewport coordinates (top-left origin). */
export async function getTextItems(page, viewport) {
  const content = await page.getTextContent()
  const out = []
  content.items.forEach((it, i) => {
    if (!it.str || !it.str.trim()) return
    const tx = pdfjsLib.Util.transform(viewport.transform, it.transform)
    // Only upright, left-to-right runs can be replaced cleanly.
    if (Math.abs(tx[1]) > 1e-3 || Math.abs(tx[2]) > 1e-3 || tx[0] <= 0) return
    const size = Math.abs(tx[3])
    if (size < 1 || it.width <= 0) return

    const style = content.styles[it.fontName] || {}
    let family = style.fontFamily === 'serif' ? 'serif' : style.fontFamily === 'monospace' ? 'mono' : 'sans'
    let bold = false
    try {
      const font = page.commonObjs.get(it.fontName)
      const name = font?.name || ''
      bold = !!font?.bold || /bold|black|heavy|semibold|demi/i.test(name)
      if (/courier|mono/i.test(name)) family = 'mono'
      else if (/times|georgia|garamond|roman|serif/i.test(name) && !/sans/i.test(name)) family = 'serif'
    } catch { /* font not resolved yet; keep the style guess */ }

    const x = tx[4], baseline = tx[5]
    out.push({
      key: i, str: it.str, x, baseline, size, family, bold,
      cover: { x: x - 1, y: baseline - size * 0.95, w: it.width + 2, h: size * 1.22 },
    })
  })
  return out
}

const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

/**
 * Reads the rendered canvas under `box` to guess the background colour (most common colour on
 * the box's edge) and the text colour (the pixel furthest from that background).
 */
export function sampleBox(canvas, scale, box) {
  const fallback = { bg: '#ffffff', text: '#000000' }
  try {
    const ctx = canvas.getContext('2d')
    const x = Math.max(0, Math.floor(box.x * scale)), y = Math.max(0, Math.floor(box.y * scale))
    const w = Math.min(canvas.width - x, Math.ceil(box.w * scale)), h = Math.min(canvas.height - y, Math.ceil(box.h * scale))
    if (w < 2 || h < 2) return fallback
    const d = ctx.getImageData(x, y, w, h).data

    const buckets = new Map()
    const addEdge = (cx, cy) => {
      const i = (cy * w + cx) * 4
      const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)
      const b = buckets.get(k) || { n: 0, r: 0, g: 0, b: 0 }
      b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]
      buckets.set(k, b)
    }
    for (let cx = 0; cx < w; cx++) { addEdge(cx, 0); addEdge(cx, h - 1) }
    for (let cy = 1; cy < h - 1; cy++) { addEdge(0, cy); addEdge(w - 1, cy) }
    let best = null
    buckets.forEach((b) => { if (!best || b.n > best.n) best = b })
    const bg = { r: best.r / best.n, g: best.g / best.n, b: best.b / best.n }

    let far = 0, tc = [0, 0, 0]
    for (let i = 0; i < d.length; i += 4) {
      const dist = (d[i] - bg.r) ** 2 + (d[i + 1] - bg.g) ** 2 + (d[i + 2] - bg.b) ** 2
      if (dist > far) { far = dist; tc = [d[i], d[i + 1], d[i + 2]] }
    }
    return { bg: toHex(bg.r, bg.g, bg.b), text: far > 2500 ? toHex(...tc) : '#000000' }
  } catch {
    return fallback
  }
}

const loadImg = (src) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => reject(new Error('Could not read this image.'))
  img.src = src
})

/**
 * Normalises any browser-readable image into PNG (keeps transparency) or JPEG, which are the
 * formats a PDF can embed. Drawing through a canvas also applies EXIF rotation and caps the size.
 */
export async function prepareImage(file, maxDim = 2000) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImg(url)
    let w = img.naturalWidth || 600, h = img.naturalHeight || 400
    const k = Math.min(1, maxDim / Math.max(w, h))
    w = Math.round(w * k); h = Math.round(h * k)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    const keepAlpha = file.type !== 'image/jpeg'
    if (!keepAlpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) }
    ctx.drawImage(img, 0, 0, w, h)
    return { src: canvas.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', 0.92), width: w, height: h }
  } finally {
    URL.revokeObjectURL(url)
  }
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

// Standard PDF fonts only cover Latin (WinAnsi) characters; swap anything else for "?".
const safeText = (font, s) => {
  try { font.encodeText(s); return s } catch {
    return [...s].map((c) => { try { font.encodeText(c); return c } catch { return '?' } }).join('')
  }
}

/** Writes every overlay element into the original PDF and returns the new file's bytes. */
export async function exportPdf(bytes, pages, elements) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const fonts = {}
  const getFont = async (family, bold) => {
    const k = family + (bold ? 'B' : '')
    if (!fonts[k]) fonts[k] = await doc.embedFont(FONTS[family].std[bold ? 1 : 0])
    return fonts[k]
  }
  const images = {}
  const getImage = async (src) => {
    if (!images[src]) images[src] = src.startsWith('data:image/png') ? await doc.embedPng(src) : await doc.embedJpg(src)
    return images[src]
  }

  for (const el of elements) {
    const info = pages[el.page]
    const page = doc.getPage(el.page)
    // convertToPdfPoint maps screen coordinates back to PDF space, accounting for the page's
    // crop box and /Rotate. Rotating drawn content by the page rotation keeps it upright.
    const toPdf = (x, y) => info.viewport.convertToPdfPoint(x, y)
    const rotate = degrees(info.rotation)

    if (el.type === 'image') {
      const [x, y] = toPdf(el.x, el.y + el.h)
      page.drawImage(await getImage(el.src), { x, y, width: el.w, height: el.h, rotate })
      continue
    }

    if (el.type === 'edit') {
      const c = el.cover
      const [x, y] = toPdf(c.x, c.y + c.h)
      page.drawRectangle({ x, y, width: c.w, height: c.h, color: hexToRgb(el.bg), rotate })
    }

    const text = (el.text || '').replace(/\n$/, '')
    if (!text.trim()) continue
    const font = await getFont(el.family, el.bold)
    const base = FONTS[el.family].baseline
    text.split('\n').forEach((line, i) => {
      if (!line) return
      const [x, y] = toPdf(el.x, el.y + el.size * (base + i * LINE_HEIGHT))
      page.drawText(safeText(font, line), { x, y, size: el.size, font, color: hexToRgb(el.color), rotate })
    })
  }
  return doc.save()
}
