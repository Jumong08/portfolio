import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { skills, proficiency } from '../data.js'
import { Reveal, SectionTitle } from './Reveal.jsx'

function SpotlightCard({ children, color, className }) {
  const [pos, setPos] = useState({ x: 50, y: 50 })
  return (
    <motion.div
      className={`glass spotlight ${className || ''}`}
      style={{ '--spot': color, '--x': `${pos.x}%`, '--y': `${pos.y}%` }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
      }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

export default function Skills() {
  const [filter, setFilter] = useState('All')
  const cats = ['All', ...skills.map((s) => s.category)]
  const shown = filter === 'All' ? skills : skills.filter((s) => s.category === filter)
  const allItems = skills.flatMap((s) => s.items)

  return (
    <section id="skills" className="section">
      <SectionTitle kicker="02 · Skills" title="My technical toolbox" />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...allItems, ...allItems].map((s, i) => <span key={i}>{s}<i>✦</i></span>)}
        </div>
      </div>

      <Reveal className="filters">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`filter ${filter === c ? 'on' : ''}`}>
            {filter === c && <motion.span layoutId="filter-bg" className="filter-bg" />}
            <span>{c}</span>
          </button>
        ))}
      </Reveal>

      <motion.div layout className="skills-grid">
        <AnimatePresence mode="popLayout">
          {shown.map((s, i) => (
            <motion.div
              key={s.category}
              layout
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <SpotlightCard color={s.color} className="skill-card">
                <div className="skill-head">
                  <span className="skill-icon" style={{ background: `${s.color}22`, borderColor: `${s.color}55` }}>{s.icon}</span>
                  <h3>{s.category}</h3>
                </div>
                <div className="tags">
                  {s.items.map((it, j) => (
                    <motion.span
                      key={it}
                      className="tag"
                      style={{ '--c': s.color }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + j * 0.04 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {it}
                    </motion.span>
                  ))}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <Reveal className="glass bars">
        <h3 className="bars-title">Core proficiency</h3>
        {proficiency.map((p, i) => (
          <div key={p.name} className="bar">
            <div className="bar-top"><span>{p.name}</span><span className="mono">{p.level}%</span></div>
            <div className="bar-track">
              <motion.div
                className="bar-fill"
                initial={{ width: 0 }}
                whileInView={{ width: `${p.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
