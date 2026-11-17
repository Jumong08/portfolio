import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { profile } from '../data.js'

const links = ['about', 'skills', 'experience', 'education', 'contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    links.forEach((id) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  return (
    <motion.header
      className={`nav ${scrolled ? 'nav-scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ delay: 1.9, type: 'spring', stiffness: 120, damping: 18 }}
    >
      <a href="#home" className="nav-logo">
        <span className="gradient-text">{profile.initials}</span><span className="dot">.</span>
      </a>
      <nav className="nav-links">
        {links.map((l) => (
          <a key={l} href={`#${l}`} className={active === l ? 'active' : ''}>
            {active === l && <motion.span layoutId="pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <span className="nav-label">{l}</span>
          </a>
        ))}
      </nav>
      <button className={`burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {links.map((l, i) => (
              <motion.a
                key={l} href={`#${l}`} onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              >
                {l}
              </motion.a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
