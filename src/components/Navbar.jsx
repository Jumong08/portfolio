import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../data.js'
import ThemeToggle from './ThemeToggle.jsx'

const links = ['about', 'experience', 'skills', 'education', 'contact']

// Add future tools here; each shows up in the "Tools" menu.
const tools = [
  { href: '#/tools/pdf-editor', label: 'PDF Editor', desc: 'Edit text, add images and sign PDFs' },
]

export default function Navbar({ onTool = false }) {
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const toolsRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    links.forEach((id) => { const el = document.getElementById(id); el && io.observe(el) })
    if (onTool) setActive('')
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [onTool])

  // Close the Tools menu on an outside click or Escape.
  useEffect(() => {
    if (!toolsOpen) return
    const onDown = (e) => { if (!toolsRef.current?.contains(e.target)) setToolsOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setToolsOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [toolsOpen])

  const closeAll = () => { setOpen(false); setToolsOpen(false) }
  const currentHash = typeof window !== 'undefined' ? window.location.hash : ''

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#home" className="nav-logo">{profile.name}</a>
        <div className="nav-actions">
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            {links.map((l) => (
              <a key={l} href={`#${l}`} className={active === l ? 'active' : ''} onClick={closeAll}>
                {l}
                {active === l && <motion.span layoutId="nav-underline" className="nav-underline" />}
              </a>
            ))}
            <div className={`nav-dropdown ${toolsOpen ? 'is-open' : ''}`} ref={toolsRef}>
              <button
                className={`nav-dropdown-btn ${onTool ? 'active' : ''}`}
                onClick={() => setToolsOpen((v) => !v)}
                aria-expanded={toolsOpen} aria-haspopup="true"
              >
                Tools
                <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {onTool && <motion.span layoutId="nav-underline" className="nav-underline" />}
              </button>
              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    className="nav-menu"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {tools.map((t) => (
                      <a key={t.href} href={t.href} className={`nav-menu-item ${currentHash.startsWith(t.href) ? 'current' : ''}`} onClick={closeAll}>
                        <span className="nav-menu-label">{t.label}</span>
                        <span className="nav-menu-desc">{t.desc}</span>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
