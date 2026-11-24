import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import { profile } from './data.js'

// Loaded on demand so the PDF libraries don't add weight to the portfolio itself.
const PdfEditorPage = lazy(() => import('./pages/PdfEditorPage.jsx'))

export const PDF_EDITOR_ROUTE = '#/tools/pdf-editor'
const HOME_TITLE = document.title

// Routes use "#/..." so they never collide with the "#section" anchors and work on any static host.
const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const onPdfEditor = hash.startsWith(PDF_EDITOR_ROUTE)

  useEffect(() => {
    if (onPdfEditor) { window.scrollTo(0, 0); return }
    // Coming back from a tool page: jump to the requested section once it has rendered.
    const id = hash.slice(1)
    if (id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView()
  }, [onPdfEditor]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = onPdfEditor ? `PDF Editor | ${profile.name}` : HOME_TITLE
  }, [onPdfEditor])

  return (
    <>
      <Navbar onTool={onPdfEditor} />
      <main>
        {onPdfEditor ? (
          <Suspense fallback={<div className="container" style={{ padding: '80px 24px', color: 'var(--muted)' }}>Loading editor…</div>}>
            <PdfEditorPage />
          </Suspense>
        ) : (
          <>
            <Hero />
            <About />
            <Experience />
            <Skills />
            <Education />
            <Contact />
          </>
        )}
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </>
  )
}
