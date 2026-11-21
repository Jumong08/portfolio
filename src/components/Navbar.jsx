import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data.js'
import ThemeToggle from './ThemeToggle.jsx'

const links = ['about', 'experience', 'skills', 'education', 'contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    links.forEach((id) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#home" className="nav-logo">{profile.name}</a>
        <div className="nav-actions">
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            {links.map((l) => (
              <a key={l} href={`#${l}`} className={active === l ? 'active' : ''} onClick={() => setOpen(false)}>
                {l}
                {active === l && <motion.span layoutId="nav-underline" className="nav-underline" />}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            Menu
          </button>
        </div>
      </div>
    </header>
  )
}
