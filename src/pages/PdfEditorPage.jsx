import PdfEditor from '../tools/pdf/PdfEditor.jsx'
import '../tools/pdf/pdf-editor.css'

const features = ['Edit existing text', 'Add text', 'Add images', 'Draw or type a signature', 'Private: runs in your browser']

export default function PdfEditorPage() {
  return (
    <section className="tool-page">
      <div className="container-wide">
        <div className="tool-head">
          <a href="#home" className="tool-back">← Back to portfolio</a>
          <span className="eyebrow" style={{ display: 'block' }}>Free tool</span>
          <h1 className="section-title">PDF Editor</h1>
          <p className="tool-lead">
            Open a PDF to change its text, add new text and images, and sign it. Everything happens in your
            browser — your file is never uploaded anywhere.
          </p>
          <ul className="tool-features">
            {features.map((f) => <li key={f} className="tag">{f}</li>)}
          </ul>
        </div>
        <PdfEditor />
      </div>
    </section>
  )
}
