import { education } from '../data.js'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

export default function Education() {
  return (
    <Section id="education" eyebrow="Education" title="Academic background">
      <Reveal className="card edu">
        <span className="job-period">{education.period}</span>
        <h3>{education.degree}</h3>
        <p className="job-company">{education.school}, {education.location}</p>
      </Reveal>
    </Section>
  )
}
