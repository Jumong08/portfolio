import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { experience } from '../data.js'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

function Job({ job, current }) {
  const [open, setOpen] = useState(current)
  const visible = open ? job.points : job.points.slice(0, 3)

  return (
    <Reveal className="timeline-item">
      <span className={`timeline-dot ${current ? 'is-current' : ''}`} />
      <article className="card job">
        <div className="job-top">
          <span className="job-period">{job.period}</span>
          {current && <span className="pill">Current</span>}
        </div>
        <h3>{job.role}</h3>
        <p className="job-company">{job.company}</p>
        <ul>
          <AnimatePresence initial={false}>
            {visible.map((p) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                {p}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {job.points.length > 3 && (
          <button className="link-btn" onClick={() => setOpen(!open)}>
            {open ? 'Show less' : `Show ${job.points.length - 3} more`}
          </button>
        )}
        <ul className="tags">
          {job.tags.map((t) => <li key={t} className="tag">{t}</li>)}
        </ul>
      </article>
    </Reveal>
  )
}

export default function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where I've worked">
      <div className="timeline">
        {experience.map((job, i) => <Job key={job.company} job={job} current={i === 0} />)}
      </div>
    </Section>
  )
}
