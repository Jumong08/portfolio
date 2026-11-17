import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { profile } from '../data.js'

function Typewriter({ words }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[i % words.length]
    let t
    if (!deleting && text === word) t = setTimeout(() => setDeleting(true), 1600)
    else if (deleting && text === '') { setDeleting(false); setI(i + 1) }
    else t = setTimeout(() => setText(word.slice(0, text.length + (deleting ? -1 : 1))), deleting ? 35 : 70)
    return () => clearTimeout(t)
  }, [text, deleting, i, words])

  return <span className="typewriter">{text}<span className="caret">|</span></span>
}

export function Avatar({ size = 'lg' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`avatar avatar-${size}`}>
      <div className="avatar-ring" />
      <div className="avatar-inner">
        {failed ? (
          <span className="avatar-initials">{profile.initials}</span>
        ) : (
          <img src={profile.photo} alt={profile.name} onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  )
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 40, filter: 'blur(8px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }

export default function Hero({ ready }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 150, damping: 15 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 15 })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  const letters = profile.lastName.split('')

  return (
    <section id="home" className="hero">
      <motion.div className="hero-text" variants={container} initial="hidden" animate={ready ? 'show' : 'hidden'}>
        <motion.div variants={item} className="badge">
          <span className="pulse" /> Available for opportunities
        </motion.div>
        <motion.p variants={item} className="hero-hello">Hi, I'm</motion.p>
        <motion.h1 variants={item} className="hero-name">
          {profile.firstName}{' '}
          <span className="gradient-text name-letters">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                className="letter"
                whileHover={{ y: -12, rotate: -8, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
              >
                {l}
              </motion.span>
            ))}
          </span>
        </motion.h1>
        <motion.h2 variants={item} className="hero-role">
          <Typewriter words={profile.roles} />
        </motion.h2>
        <motion.p variants={item} className="hero-desc">
          9+ years crafting business-critical web apps with <b>.NET</b>, <b>C#</b>, <b>React</b> and <b>Azure</b> —
          from secure APIs and cloud pipelines to polished frontends and mobile apps.
        </motion.p>
        <motion.div variants={item} className="hero-cta">
          <motion.a href="#contact" className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Let's work together <span>→</span>
          </motion.a>
          <motion.a href="#experience" className="btn btn-ghost" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            View experience
          </motion.a>
        </motion.div>
        <motion.div variants={item} className="hero-meta">
          <span>📍 {profile.location}</span>
          <span>✉️ {profile.email}</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ perspective: 1000 }}
      >
        <motion.div className="tilt" style={{ rotateX: rx, rotateY: ry }}>
          <Avatar />
          {[
            { t: '.NET 8', c: 'chip-1' },
            { t: 'React', c: 'chip-2' },
            { t: 'Azure', c: 'chip-3' },
            { t: 'C#', c: 'chip-4' },
            { t: 'Docker', c: 'chip-5' },
          ].map((chip, i) => (
            <motion.div
              key={chip.t}
              className={`float-chip ${chip.c}`}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            >
              {chip.t}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        className="scroll-hint"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
      >
        <span className="mouse"><span className="wheel" /></span>
        scroll
      </motion.a>
    </section>
  )
}
