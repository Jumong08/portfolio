import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import Background from './components/Background.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Loader from './components/Loader.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <Background />
      <Navbar />
      <main>
        <Hero ready={!loading} />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Contact />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} John Mikhail Arazo · Built with React &amp; Framer Motion
      </footer>
    </>
  )
}
