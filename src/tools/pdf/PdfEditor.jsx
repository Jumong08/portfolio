import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadPdf, exportPdf, getTextItems, sampleBox, prepareImage, FONTS, LINE_HEIGHT } from './pdfUtils.js'
import SignatureModal from './SignatureModal.jsx'

let uid = 0
const nextId = () => `el${++uid}`
const ZOOMS = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 2, 2.5, 3]
const clampZoom = (z) => Math.min(3, Math.max(0.4, z))

// Firefox before v136 has no "plaintext-only"; fall back so pasted HTML is still read as text.
const CE_MODE = (() => {
  try {
    const d = document.createElement('div')
    d.contentEditable = 'plaintext-only'
    return d.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true'
  } catch { return 'true' }
})()

const Ico = ({ d, children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
)
const icons = {
  select: <Ico d="M4 3l7 17 2.5-7.5L21 10z" />,
  edit: <Ico><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Ico>,
  text: <Ico><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></Ico>,
  image: <Ico><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></Ico>,
  sign: <Ico><path d="M3 17c3-1 4-9 6-9s-1 9 2 9 3-5 5-5 1 4 3 4h2" /><path d="M3 21h18" /></Ico>,
  download: <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></Ico>,
  trash: <Ico><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></Ico>,
  file: <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Ico>,
}

/** Moves or resizes an element while the pointer is held down. */
function startDrag(e, el, mode, zoom, update) {
  e.preventDefault()
  e.stopPropagation()
  const sx = e.clientX, sy = e.clientY
  const orig = { ...el }
  const move = (ev) => {
    const dx = (ev.clientX - sx) / zoom, dy = (ev.clientY - sy) / zoom
    if (mode === 'move') update(el.id, { x: orig.x + dx, y: orig.y + dy })
    else {
      const w = Math.max(12, orig.w + dx)
      update(el.id, { w, h: (w * orig.h) / orig.w })
    }
  }
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
}

function TextBox({ el, zoom, onSelect, update, remove }) {
  const ref = useRef(null)
  // The box is edited in place, so React only writes its text when it changed from outside
  // (e.g. "Reset"), never while the user types — that would move the caret.
  useEffect(() => {
    if (ref.current.innerText !== el.text) ref.current.innerText = el.text
  }, [el.text])
  useEffect(() => {
    if (!el.autoFocus) return
    const n = ref.current
    n.focus()
    const range = document.createRange()
    range.selectNodeContents(n)
    if (el.type === 'text') range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges(); sel.addRange(range)
    update(el.id, { autoFocus: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      className="pdf-textbox"
      contentEditable={CE_MODE}
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={el.type === 'edit' ? 'Edited PDF text' : 'Added text'}
      data-placeholder="Type here"
      style={{
        fontSize: el.size * zoom, fontFamily: FONTS[el.family].css, fontWeight: el.bold ? 700 : 400,
        color: el.color, lineHeight: LINE_HEIGHT,
      }}
      onPointerDown={(e) => { e.stopPropagation(); onSelect(el.id) }}
      onFocus={() => onSelect(el.id)}
      onInput={(e) => update(el.id, { text: e.currentTarget.innerText })}
      onBlur={(e) => { if (el.type === 'text' && !e.currentTarget.innerText.trim()) remove(el.id) }}
    />
  )
}

function ElementView({ el, zoom, selected, onSelect, update, remove }) {
  if (el.type === 'image') {
    return (
      <div
        className={`pdf-el pdf-img ${selected ? 'is-selected' : ''}`}
        style={{ left: el.x * zoom, top: el.y * zoom, width: el.w * zoom, height: el.h * zoom }}
        onPointerDown={(e) => { onSelect(el.id); startDrag(e, el, 'move', zoom, update) }}
      >
        <img src={el.src} alt="" draggable={false} />
        {selected && (
          <span className="pdf-handle" title="Drag to resize" onPointerDown={(e) => startDrag(e, el, 'resize', zoom, update)} />
        )}
      </div>
    )
  }
  const c = el.cover
  return (
    <>
      {el.type === 'edit' && (
        <div className="pdf-cover" style={{ left: c.x * zoom, top: c.y * zoom, width: c.w * zoom, height: c.h * zoom, background: el.bg }} />
      )}
      <div className={`pdf-el pdf-text ${selected ? 'is-selected' : ''}`} style={{ left: el.x * zoom, top: el.y * zoom }}>
        {selected && el.type === 'text' && (
          <button
            className="pdf-grip" title="Drag to move" aria-label="Move text"
            onPointerDown={(e) => { onSelect(el.id); startDrag(e, el, 'move', zoom, update) }}
          >
            <svg viewBox="0 0 10 16" aria-hidden="true"><g fill="currentColor">{[3, 8, 13].map((y) => [2.5, 7.5].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.4" />))}</g></svg>
          </button>
        )}
        <TextBox el={el} zoom={zoom} onSelect={onSelect} update={update} remove={remove} />
      </div>
    </>
  )
}

function PageView({ doc, info, zoom, tool, elements, selectedId, editedKeys, onPageClick, onEditItem, onSelect, update, remove }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const renderScale = useRef(0)
  const itemsRequested = useRef(false)
  const [visible, setVisible] = useState(false)
  const [items, setItems] = useState(null)

  // Render pages only once they get near the viewport, so long documents open quickly.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '800px 0px' })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let task, cancelled = false
    ;(async () => {
      const page = await doc.getPage(info.index + 1)
      if (cancelled) return
      const scale = zoom * Math.min(window.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({ scale })
      // Render off-screen, then swap in, so zooming doesn't flash a blank page.
      const off = document.createElement('canvas')
      off.width = Math.ceil(viewport.width); off.height = Math.ceil(viewport.height)
      task = page.render({ canvasContext: off.getContext('2d'), viewport })
      await task.promise
      if (cancelled) return
      const c = canvasRef.current
      c.width = off.width; c.height = off.height
      c.getContext('2d').drawImage(off, 0, 0)
      renderScale.current = scale
      if (!itemsRequested.current) {
        itemsRequested.current = true
        setItems(await getTextItems(page, info.viewport))
      }
    })().catch((err) => { if (err?.name !== 'RenderingCancelledException') console.error(err) })
    return () => { cancelled = true; task?.cancel() }
  }, [visible, zoom, doc, info])

  const W = info.width * zoom, H = info.height * zoom

  const onOverlayDown = (e) => {
    if (e.target !== e.currentTarget) return
    if (tool === 'text' || tool === 'place') e.preventDefault() // keep focus for the new box
    else document.activeElement?.blur?.()
    const r = e.currentTarget.getBoundingClientRect()
    onPageClick(info.index, (e.clientX - r.left) / zoom, (e.clientY - r.top) / zoom)
  }

  return (
    <div className="pdf-page-wrap">
      <div ref={wrapRef} className={`pdf-page tool-${tool}`} style={{ width: W, height: H }}>
        <canvas ref={canvasRef} style={{ width: W, height: H }} />
        <div className="pdf-overlay" onPointerDown={onOverlayDown}>
          {tool === 'edit' && items?.filter((it) => !editedKeys.has(`${info.index}:${it.key}`)).map((it) => (
            <button
              key={it.key} className="pdf-textitem" title="Click to edit this text" aria-label={`Edit "${it.str}"`}
              style={{ left: it.cover.x * zoom, top: it.cover.y * zoom, width: it.cover.w * zoom, height: it.cover.h * zoom }}
              onPointerDown={(e) => {
                e.preventDefault(); e.stopPropagation()
                onEditItem(info.index, it, sampleBox(canvasRef.current, renderScale.current, it.cover))
              }}
            />
          ))}
          {elements.map((el) => (
            <ElementView key={el.id} el={el} zoom={zoom} selected={el.id === selectedId} onSelect={onSelect} update={update} remove={remove} />
          ))}
        </div>
      </div>
      <span className="pdf-page-num">Page {info.index + 1}</span>
    </div>
  )
}

const HINTS = {
  select: 'Click an item to select it. Drag images to move them, and their corner to resize.',
  edit: 'Click any highlighted text on the page to change it. Clear the text to delete it.',
  text: 'Click anywhere on a page to add text.',
  place: 'Click on a page to place it. Press Esc to cancel.',
}

export default function PdfEditor() {
  const [file, setFile] = useState(null)
  const [doc, setDoc] = useState(null)
  const [pages, setPages] = useState([])
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState('select')
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [pending, setPending] = useState(null)
  const [sigOpen, setSigOpen] = useState(false)
  const [signatures, setSignatures] = useState([])
  const [textStyle, setTextStyle] = useState({ size: 14, color: '#111111', family: 'sans', bold: false })
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [output, setOutput] = useState(null) // last exported file: { url, blob, name }
  const stageRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const docRef = useRef(null)

  useEffect(() => () => docRef.current?.destroy(), [])
  // Keep the exported file's URL alive while its banner is shown; free it once replaced.
  useEffect(() => () => { if (output) URL.revokeObjectURL(output.url) }, [output])
  // Any further edit makes the last export out of date.
  useEffect(() => { setOutput(null) }, [elements, file])

  const update = useCallback((id, patch) => setElements((els) => els.map((e) => (e.id === id ? { ...e, ...patch } : e))), [])
  const remove = useCallback((id) => {
    setElements((els) => els.filter((e) => e.id !== id))
    setSelectedId((s) => (s === id ? null : s))
  }, [])
  const add = useCallback((el) => { setElements((els) => [...els, el]); setSelectedId(el.id) }, [])

  const selected = elements.find((e) => e.id === selectedId) || null
  const editedKeys = useMemo(() => new Set(elements.filter((e) => e.type === 'edit').map((e) => `${e.page}:${e.key}`)), [elements])
  const byPage = useMemo(() => {
    const m = {}
    elements.forEach((e) => { (m[e.page] ||= []).push(e) })
    return m
  }, [elements])

  const fitZoom = useCallback((list = pages) => {
    const avail = (stageRef.current?.clientWidth || 900) - 48
    const maxW = Math.max(...list.map((p) => p.width))
    return clampZoom(Math.min(1.5, avail / maxW))
  }, [pages])

  const openFile = async (f) => {
    if (!f) return
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) { setError('Please choose a PDF file.'); return }
    if (elements.length && !window.confirm('Open a new file? Your unsaved changes to the current PDF will be lost.')) return
    setError(''); setBusy('Opening PDF…')
    try {
      const bytes = new Uint8Array(await f.arrayBuffer())
      const loaded = await loadPdf(bytes)
      docRef.current?.destroy()
      docRef.current = loaded.doc
      setDoc(loaded.doc); setPages(loaded.pages); setZoom(fitZoom(loaded.pages))
      setFile({ name: f.name, bytes })
      setElements([]); setSelectedId(null); setTool('select'); setPending(null)
    } catch (e) {
      setError(e?.name === 'PasswordException'
        ? 'This PDF is password-protected. Remove the password and try again.'
        : 'Could not open this file. It may be damaged or not a valid PDF.')
    } finally {
      setBusy('')
    }
  }

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!elements.length) return
    const onUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [elements.length])

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
      if (e.key === 'Escape') {
        if (typing) t.blur()
        setSelectedId(null); setPending(null)
        setTool((cur) => (cur === 'place' ? 'select' : cur))
      } else if (!typing && selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault(); remove(selectedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, remove])

  const onPageClick = (page, x, y) => {
    if (tool === 'text') {
      add({ id: nextId(), type: 'text', page, x, y: y - textStyle.size * 0.6, text: '', ...textStyle, autoFocus: true })
      setTool('select')
    } else if (tool === 'place' && pending) {
      add({ id: nextId(), type: 'image', page, x: x - pending.w / 2, y: y - pending.h / 2, w: pending.w, h: pending.h, src: pending.src })
      setPending(null); setTool('select')
    } else {
      setSelectedId(null)
    }
  }

  const onEditItem = (page, it, colors) => {
    add({
      id: nextId(), type: 'edit', page, key: it.key,
      x: it.x, y: it.baseline - it.size * FONTS[it.family].baseline,
      size: Math.round(it.size * 10) / 10, family: it.family, bold: it.bold,
      color: colors.text, bg: colors.bg, text: it.str, original: it.str, cover: it.cover, autoFocus: true,
    })
  }

  const beginPlace = (asset, kind, maxW, maxH) => {
    const k = Math.min(maxW / asset.width, maxH / asset.height, 1)
    setPending({ kind, src: asset.src, w: asset.width * k, h: asset.height * k })
    setSelectedId(null); setTool('place')
  }

  const onImagePicked = async (f) => {
    if (!f) return
    try {
      const asset = await prepareImage(f)
      beginPlace(asset, 'image', 220, 220)
    } catch (e) {
      setError(e.message || 'Could not read this image.')
    }
  }

  const onSignature = (sig) => {
    setSigOpen(false)
    setSignatures((list) => [sig, ...list.filter((s) => s.src !== sig.src)].slice(0, 3))
    // Signature canvases are drawn at device resolution; place them at a natural signing size.
    beginPlace(sig, 'sign', 170, 60)
  }

  const setProp = (patch) => {
    if (!selected) return
    update(selected.id, patch)
    if (selected.type === 'text') setTextStyle((s) => ({ ...s, ...patch }))
  }

  const download = async () => {
    setError(''); setBusy('Building your PDF…')
    try {
      const out = await exportPdf(file.bytes, pages, elements)
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const name = file.name.replace(/\.pdf$/i, '') + '-edited.pdf'
      setOutput({ url, blob, name })
      // Start the download right away; the "ready" banner offers a manual link in case the
      // browser blocks or ignores it.
      const a = document.createElement('a')
      a.href = url; a.download = name
      document.body.appendChild(a); a.click(); a.remove()
    } catch (e) {
      console.error(e)
      setError('Could not build the PDF: ' + (e?.message || 'unknown error'))
    } finally {
      setBusy('')
    }
  }

  // "Save as…" lets the user pick the folder, where the browser supports it (Chrome, Edge).
  const canSaveAs = 'showSaveFilePicker' in window && window.self === window.top
  const saveAs = async () => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: output.name,
        types: [{ description: 'PDF document', accept: { 'application/pdf': ['.pdf'] } }],
      })
      const w = await handle.createWritable()
      await w.write(output.blob)
      await w.close()
    } catch (e) {
      if (e?.name !== 'AbortError') setError('Could not save the file: ' + (e?.message || 'unknown error'))
    }
  }
  const sizeLabel = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

  const zoomStep = (dir) => {
    const i = ZOOMS.findIndex((z) => z >= zoom - 0.001)
    const next = dir > 0 ? ZOOMS.find((z) => z > zoom + 0.001) : [...ZOOMS].reverse().find((z) => z < zoom - 0.001)
    setZoom(next ?? ZOOMS[Math.max(0, i)])
  }

  const pickTool = (t) => { setTool(t); setPending(null); if (t !== 'select') setSelectedId(null) }

  const toolBtn = (id, label, icon, onClick = () => pickTool(id), active = tool === id) => (
    <button className={`pdf-tool ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active} disabled={!doc}>
      {icon}<span>{label}</span>
    </button>
  )

  const isText = selected && (selected.type === 'text' || selected.type === 'edit')

  return (
    <div className="pdf-editor">
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-row">
          <div className="pdf-tools">
            {toolBtn('select', 'Select', icons.select)}
            {toolBtn('edit', 'Edit text', icons.edit)}
            {toolBtn('text', 'Add text', icons.text)}
            {toolBtn('image', 'Image', icons.image, () => imageInputRef.current?.click(), pending?.kind === 'image')}
            {toolBtn('sign', 'Signature', icons.sign, () => setSigOpen(true), sigOpen || pending?.kind === 'sign')}
          </div>
          <div className="pdf-tools-right">
            {doc && (
              <div className="pdf-zoom" aria-label="Zoom">
                <button onClick={() => zoomStep(-1)} aria-label="Zoom out" disabled={zoom <= ZOOMS[0]}>−</button>
                <button className="pdf-zoom-val" onClick={() => setZoom(fitZoom())} title="Fit to width">{Math.round(zoom * 100)}%</button>
                <button onClick={() => zoomStep(1)} aria-label="Zoom in" disabled={zoom >= ZOOMS[ZOOMS.length - 1]}>+</button>
              </div>
            )}
            {doc && (
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                {icons.file}<span className="hide-sm">Open</span>
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={download} disabled={!doc || !!busy}>
              {icons.download}<span>Download</span>
            </button>
          </div>
        </div>

        {doc && (
          <div className="pdf-toolbar-row pdf-props">
            {isText ? (
              <>
                <select className="pdf-input" value={selected.family} onChange={(e) => setProp({ family: e.target.value })} aria-label="Font">
                  {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
                </select>
                <input
                  className="pdf-input pdf-size" type="number" min="4" max="144" step="0.5" value={selected.size} aria-label="Font size"
                  onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 1 && v <= 400) setProp({ size: v }) }}
                />
                <button className={`pdf-chip ${selected.bold ? 'active' : ''}`} onClick={() => setProp({ bold: !selected.bold })} aria-pressed={selected.bold} aria-label="Bold"><b>B</b></button>
                <label className="pdf-color" title="Text colour">
                  <span>Text</span>
                  <input type="color" value={selected.color} onChange={(e) => setProp({ color: e.target.value })} />
                </label>
                {selected.type === 'edit' && (
                  <>
                    <label className="pdf-color" title="Colour used to cover the original text">
                      <span>Background</span>
                      <input type="color" value={selected.bg} onChange={(e) => setProp({ bg: e.target.value })} />
                    </label>
                    <button className="pdf-chip" onClick={() => update(selected.id, { text: selected.original })}>Reset text</button>
                  </>
                )}
                <button className="pdf-chip danger" onClick={() => remove(selected.id)} title={selected.type === 'edit' ? 'Undo this edit and restore the original text' : 'Delete'}>
                  {icons.trash}<span>{selected.type === 'edit' ? 'Undo edit' : 'Delete'}</span>
                </button>
              </>
            ) : selected?.type === 'image' ? (
              <>
                <span className="pdf-hint">Drag to move · drag the corner to resize</span>
                <button className="pdf-chip danger" onClick={() => remove(selected.id)}>{icons.trash}<span>Delete</span></button>
              </>
            ) : (
              <span className="pdf-hint">{HINTS[tool]}</span>
            )}
          </div>
        )}
      </div>

      {output && (
        <div className="pdf-ready" role="status">
          <span className="pdf-ready-icon" aria-hidden="true">✓</span>
          <div className="pdf-ready-text">
            <strong>Your edited PDF is ready</strong>
            <span>{output.name} · {sizeLabel(output.blob.size)}. If the download didn't start, use the buttons here.</span>
          </div>
          <div className="pdf-ready-actions">
            <a className="btn btn-primary btn-sm" href={output.url} download={output.name}>{icons.download}<span>Download PDF</span></a>
            {canSaveAs && <button className="btn btn-secondary btn-sm" onClick={saveAs}>Save as…</button>}
            <a className="btn btn-secondary btn-sm" href={output.url} target="_blank" rel="noopener noreferrer">Open in new tab</a>
          </div>
          <button className="pdf-ready-close" onClick={() => setOutput(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {error && <div className="pdf-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}

      <div
        ref={stageRef}
        className={`pdf-stage ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false) }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); openFile(e.dataTransfer.files?.[0]) }}
      >
        {!doc ? (
          <div className="pdf-drop">
            <div className="pdf-drop-icon">{icons.file}</div>
            <h3>Drop a PDF here</h3>
            <p>or choose a file from your device</p>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={!!busy}>
              {busy || 'Choose PDF'}
            </button>
            <p className="pdf-drop-note">Your file is processed in your browser and never uploaded.</p>
          </div>
        ) : (
          pages.map((info) => (
            <PageView
              key={info.index} doc={doc} info={info} zoom={zoom} tool={tool}
              elements={byPage[info.index] || []} selectedId={selectedId} editedKeys={editedKeys}
              onPageClick={onPageClick} onEditItem={onEditItem} onSelect={setSelectedId} update={update} remove={remove}
            />
          ))
        )}
        {busy && doc && <div className="pdf-busy">{busy}</div>}
      </div>

      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { openFile(e.target.files?.[0]); e.target.value = '' }} />
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={(e) => { onImagePicked(e.target.files?.[0]); e.target.value = '' }} />
      {sigOpen && <SignatureModal saved={signatures} onClose={() => setSigOpen(false)} onDone={onSignature} />}
    </div>
  )
}
