import { skills } from '../data.js'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

export default function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="Technical toolbox">
      <div className="skills-grid">
        {skills.map((s, i) => (
          <Reveal key={s.category} delay={(i % 3) * 0.08} className="card skill-group">
            <h3>{s.category}</h3>
            <ul className="tags">
              {s.items.map((it) => <li key={it} className="tag">{it}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
