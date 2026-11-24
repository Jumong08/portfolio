import { useCallback, useEffect, useRef, useState } from 'react'

const SCRIPT_FONTS = ['Dancing Script', 'Great Vibes', 'Caveat']
const INKS = [
  { label: 'Black', value: '#111111' },
  { label: 'Blue', value: '#1d3fa0' },
  { label: 'Red', value: '#b42318' },
]

let fontsLinked = false
const linkFonts = () => {
  if (fontsLinked) return
  fontsLinked = true
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&display=swap'
  document.head.appendChild(l)
}

/** Crops a canvas to its non-transparent pixels and returns it as a PNG. */
function trimCanvas(canvas, pad = 6) {
  const ctx = canvas.getContext('2d')
  const { width: w, height: h } = canvas
  const d = ctx.getImageData(0, 0, w, h).data
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x
        if (y < y0) y0 = y; if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) return null
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad)
  x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad)
  const out = document.createElement('canvas')
  out.width = x1 - x0 + 1; out.height = y1 - y0 + 1
  out.getContext('2d').drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  return { src: out.toDataURL('image/png'), width: out.width, height: out.height }
}

/** Loads an uploaded signature image, optionally turning its white/paper background transparent. */
function processUpload(img, removeBg, maxDim = 1600) {
  const k = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k))
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0, c.width, c.height)
  if (removeBg) {
    const data = ctx.getImageData(0, 0, c.width, c.height)
    const d = data.data
    for (let i = 0; i < d.length; i += 4) {
      // Near-white pixels become transparent; light greys fade out so ink edges stay smooth.
      const m = Math.min(d[i], d[i + 1], d[i + 2])
      if (m >= 235) d[i + 3] = 0
      else if (m > 190) d[i + 3] = Math.round(d[i + 3] * (235 - m) / 45)
    }
    ctx.putImageData(data, 0, 0)
  }
  return trimCanvas(c, 2)
}

/** True when an image already has meaningful transparency (e.g. a PNG signature with no background). */
function hasTransparency(img) {
  const c = document.createElement('canvas')
  const k = Math.min(1, 300 / Math.max(img.naturalWidth, img.naturalHeight))
  c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k))
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0, c.width, c.height)
  const d = ctx.getImageData(0, 0, c.width, c.height).data
  let clear = 0
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) clear++
  return clear > (d.length / 4) * 0.02
}

export default function SignatureModal({ saved, onClose, onDone }) {
  const [mode, setMode] = useState('draw')
  const [ink, setInk] = useState(INKS[0].value)
  const [name, setName] = useState('')
  const [font, setFont] = useState(SCRIPT_FONTS[0])
  const [hasInk, setHasInk] = useState(false)
  const [upload, setUpload] = useState(null) // { img, name }
  const [removeBg, setRemoveBg] = useState(true)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [uploadDrag, setUploadDrag] = useState(false)
  const uploadInputRef = useRef(null)
  const canvasRef = useRef(null)
  const strokes = useRef([])
  const drawing = useRef(false)

  useEffect(() => { linkFonts() }, [])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const redraw = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const dpr = c.width / c.clientWidth || 1
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.strokeStyle = ink; ctx.fillStyle = ink
    ctx.lineWidth = 2.6 * dpr; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    for (const pts of strokes.current) {
      if (pts.length === 1) {
        ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill()
        continue
      }
      // Smooth the stroke by curving through the midpoints between samples.
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1])
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my)
      }
      const last = pts[pts.length - 1]
      ctx.lineTo(last[0], last[1]); ctx.stroke()
    }
  }, [ink])

  useEffect(() => {
    if (mode !== 'draw') return
    const c = canvasRef.current
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr)
    redraw()
  }, [mode, redraw])

  const pos = (e) => {
    const c = canvasRef.current, r = c.getBoundingClientRect()
    return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)]
  }
  const onDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    strokes.current.push([pos(e)])
    setHasInk(true); redraw()
  }
  const onMove = (e) => {
    if (!drawing.current) return
    const stroke = strokes.current[strokes.current.length - 1]
    const events = e.nativeEvent.getCoalescedEvents?.() || [e]
    events.forEach((ev) => stroke.push(pos(ev)))
    redraw()
  }
  const onUp = () => { drawing.current = false }
  const clear = () => { strokes.current = []; setHasInk(false); redraw() }

  const pickUpload = (file) => {
    if (!file) return
    setUploadError('')
    if (!file.type.startsWith('image/')) { setUploadError('Please choose a PNG or JPG image.'); return }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // A transparent PNG is used as-is; a scan or photo gets its paper background removed.
      setRemoveBg(!hasTransparency(img))
      setUpload({ img, name: file.name })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => { setUploadError('Could not read this image.'); URL.revokeObjectURL(url) }
    img.src = url
  }

  useEffect(() => {
    if (!upload) { setUploadResult(null); return }
    const result = processUpload(upload.img, removeBg)
    setUploadResult(result)
    setUploadError(result ? '' : 'This image looks empty. Try turning off "Remove white background".')
  }, [upload, removeBg])

  const finish = async () => {
    if (mode === 'upload') {
      if (uploadResult) onDone(uploadResult)
      return
    }
    if (mode === 'draw') {
      const result = trimCanvas(canvasRef.current)
      if (result) onDone(result)
      return
    }
    const fontCss = `120px "${font}"`
    try { await document.fonts.load(fontCss, name) } catch { /* fall back to whatever is available */ }
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    ctx.font = fontCss
    c.width = Math.ceil(ctx.measureText(name).width + 80); c.height = 220
    ctx.font = fontCss; ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic'
    ctx.fillText(name, 40, 150)
    const result = trimCanvas(c)
    if (result) onDone(result)
  }

  const canFinish = mode === 'draw' ? hasInk : mode === 'upload' ? !!uploadResult : name.trim().length > 0

  return (
    <div className="sig-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sig-modal card" role="dialog" aria-modal="true" aria-labelledby="sig-title">
        <div className="sig-head">
          <h3 id="sig-title">Add signature</h3>
          <button className="sig-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {saved.length > 0 && (
          <div className="sig-saved">
            <span className="sig-label">Use a recent signature</span>
            <div className="sig-saved-list">
              {saved.map((s, i) => (
                <button key={i} className="sig-saved-item" onClick={() => onDone(s)} aria-label={`Use recent signature ${i + 1}`}>
                  <img src={s.src} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sig-tabs" role="tablist">
          {[['draw', 'Draw'], ['type', 'Type'], ['upload', 'Upload image']].map(([m, label]) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'draw' ? (
          <div className="sig-pad-wrap">
            <canvas
              ref={canvasRef} className="sig-pad"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            />
            {!hasInk && <span className="sig-pad-hint">Sign here with your mouse, pen or finger</span>}
            <span className="sig-line" />
          </div>
        ) : mode === 'upload' ? (
          <div className="sig-upload">
            <div
              className={`sig-upload-area ${uploadDrag ? 'drag-over' : ''}`}
              onClick={() => uploadInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); uploadInputRef.current?.click() } }}
              onDragOver={(e) => { e.preventDefault(); setUploadDrag(true) }}
              onDragLeave={() => setUploadDrag(false)}
              onDrop={(e) => { e.preventDefault(); setUploadDrag(false); pickUpload(e.dataTransfer.files?.[0]) }}
              role="button" tabIndex={0} aria-label="Choose a signature image"
            >
              {uploadResult ? (
                <img src={uploadResult.src} alt="Signature preview" />
              ) : (
                <span className="sig-pad-hint">Drop a PNG of your signature here, or click to choose one</span>
              )}
            </div>
            <input
              ref={uploadInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
              onChange={(e) => { pickUpload(e.target.files?.[0]); e.target.value = '' }}
            />
            {upload && (
              <div className="sig-upload-row">
                <label className="sig-check">
                  <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
                  Remove white background
                </label>
                <button className="link-btn" onClick={() => uploadInputRef.current?.click()}>Choose another</button>
              </div>
            )}
            {uploadError && <p className="sig-upload-error" role="alert">{uploadError}</p>}
          </div>
        ) : (
          <div className="sig-type">
            <input
              className="pdf-input sig-name" placeholder="Type your name" value={name} autoFocus
              onChange={(e) => setName(e.target.value)} maxLength={60}
            />
            <div className="sig-fonts">
              {SCRIPT_FONTS.map((f) => (
                <button key={f} className={`sig-font ${font === f ? 'active' : ''}`} style={{ fontFamily: `"${f}", cursive`, color: ink }} onClick={() => setFont(f)}>
                  {name.trim() || 'Your Name'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sig-foot">
          <div className="sig-inks" aria-label="Ink colour" style={mode === 'upload' ? { visibility: 'hidden' } : undefined}>
            {INKS.map((c) => (
              <button
                key={c.value} className={`sig-ink ${ink === c.value ? 'active' : ''}`} style={{ background: c.value }}
                onClick={() => setInk(c.value)} aria-label={`${c.label} ink`} aria-pressed={ink === c.value}
              />
            ))}
          </div>
          <div className="sig-actions">
            {mode === 'draw' && <button className="btn btn-secondary btn-sm" onClick={clear} disabled={!hasInk}>Clear</button>}
            <button className="btn btn-primary btn-sm" onClick={finish} disabled={!canFinish}>Place signature</button>
          </div>
        </div>
      </div>
    </div>
  )
}
