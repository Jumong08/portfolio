import { useRef, useState } from 'react'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import { experience } from '../data.js'
import { SectionTitle } from './Reveal.jsx'

function Job({ job, index }) {
  const [open, setOpen] = useState(index === 0)
  const visible = open ? job.points : job.points.slice(0, 3)

  return (
    <motion.div
      className="job"
      initial={{ opacity: 0, x: index % 2 ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="job-dot"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
      />
      <motion.div className="glass job-card" whileHover={{ y: -4 }}>
        <div className="job-top">
          <span className="job-period mono">{job.period}</span>
          {index === 0 && <span className="current">● Current</span>}
        </div>
        <h3>{job.role}</h3>
        <p className="job-company">{job.company}</p>
        <div className="tags small">
          {job.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
        <ul>
          <AnimatePresence initial={false}>
            {visible.map((p) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {p}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {job.points.length > 3 && (
          <button className="more" onClick={() => setOpen(!open)}>
            {open ? 'Show less ↑' : `Show ${job.points.length - 3} more ↓`}
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Experience() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })

  return (
    <section id="experience" className="section">
      <SectionTitle kicker="03 · Experience" title="Where I've made an impact" />
      <div className="timeline" ref={ref}>
        <div className="timeline-line" />
        <motion.div className="timeline-line fill" style={{ scaleY: scrollYProgress }} />
        {experience.map((job, i) => <Job key={job.company} job={job} index={i} />)}
      </div>
    </section>
  )
}
