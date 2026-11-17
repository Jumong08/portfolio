import { useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data.js'
import { Reveal, SectionTitle } from './Reveal.jsx'
import { Avatar } from './Hero.jsx'

function MagneticButton({ children, href }) {
  const [p, setP] = useState({ x: 0, y: 0 })
  return (
    <motion.a
      href={href}
      className="btn btn-primary btn-big"
      animate={{ x: p.x, y: p.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setP({ x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35 })
      }}
      onMouseLeave={() => setP({ x: 0, y: 0 })}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState('')
  const copy = async (label, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); setTimeout(() => setCopied(''), 1500) } catch { /* ignore */ }
  }

  const items = [
    { label: 'Email', value: profile.email, icon: '✉️', href: `mailto:${profile.email}` },
    { label: 'Phone', value: profile.phone, icon: '📞', href: `tel:${profile.phone}` },
    { label: 'Location', value: profile.location, icon: '📍' },
  ]

  return (
    <section id="contact" className="section">
      <SectionTitle kicker="05 · Contact" title="Let's build something great" />
      <Reveal className="glass contact-card">
        <div className="contact-left">
          <Avatar size="sm" />
          <h3>{profile.name}</h3>
          <p className="job-company">{profile.title}</p>
          <p className="contact-text">
            Have a project, role, or idea in mind? I'm always open to discussing new opportunities
            in full stack, .NET, React, and cloud development.
          </p>
          <MagneticButton href={`mailto:${profile.email}`}>Say hello 👋</MagneticButton>
        </div>
        <div className="contact-right">
          {items.map((it, i) => (
            <motion.div
              key={it.label}
              className="contact-item"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.12 }}
              whileHover={{ x: 8 }}
            >
              <span className="contact-icon">{it.icon}</span>
              <div className="contact-info">
                <span className="contact-label">{it.label}</span>
                {it.href ? <a href={it.href}>{it.value}</a> : <span>{it.value}</span>}
              </div>
              <button className="copy" onClick={() => copy(it.label, it.value)}>
                {copied === it.label ? '✓ Copied' : 'Copy'}
              </button>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
