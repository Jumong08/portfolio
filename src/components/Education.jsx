import { motion } from 'framer-motion'
import { education } from '../data.js'
import { Reveal, SectionTitle } from './Reveal.jsx'

export default function Education() {
  return (
    <section id="education" className="section">
      <SectionTitle kicker="04 · Education" title="Foundations" />
      <Reveal>
        <motion.div className="glass edu-card" whileHover={{ scale: 1.02 }}>
          <motion.div
            className="edu-icon"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🎓
          </motion.div>
          <div>
            <span className="mono job-period">{education.period}</span>
            <h3>{education.degree}</h3>
            <p className="job-company">{education.school} — {education.location}</p>
          </div>
        </motion.div>
      </Reveal>
    </section>
  )
}
