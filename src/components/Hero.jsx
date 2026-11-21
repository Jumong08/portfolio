import { useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data.js'

export function Avatar({ size = 'lg' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`avatar avatar-${size}`}>
      {failed ? (
        <span className="avatar-initials">{profile.initials}</span>
      ) : (
        <img src={profile.photo} alt={profile.name} onError={() => setFailed(true)} />
      )}
    </div>
  )
}

const ease = [0.22, 1, 0.36, 1]
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container hero-inner">
        <motion.div className="hero-text" variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="badge">
            <span className="badge-dot" /> Available for opportunities
          </motion.span>
          <motion.h1 variants={item} className="hero-name">
            {profile.firstName} <span className="accent">{profile.lastName}</span>
          </motion.h1>
          <motion.p variants={item} className="hero-role">{profile.title}</motion.p>
          <motion.p variants={item} className="hero-desc">
            9+ years building and maintaining business-critical web applications with .NET, C#,
            React and Azure, from secure APIs and cloud pipelines to frontends and mobile apps.
          </motion.p>
          <motion.div variants={item} className="hero-cta">
            <a href="#contact" className="btn btn-primary">Contact me <span className="arrow">→</span></a>
            <a href="#experience" className="btn btn-secondary">View experience</a>
          </motion.div>
          <motion.p variants={item} className="hero-meta">{profile.location} · {profile.email}</motion.p>
        </motion.div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease }}
        >
          <Avatar />
        </motion.div>
      </div>
    </section>
  )
}
