import Reveal from './Reveal.jsx'

export default function Section({ id, title, eyebrow, children }) {
  return (
    <section id={id} className="section">
      <div className="container">
        <Reveal className="section-head">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className="section-title">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
