import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { profile, stats } from '../data.js'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.2, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  return <span ref={ref}>{n}{suffix}</span>
}

export default function About() {
  const facts = stats.filter((s) => s.label !== 'Full stack')
  return (
    <Section id="about" eyebrow="About" title="Building software that businesses run on">
      <div className="about-grid">
        <Reveal className="about-text">
          <p>{profile.summary}</p>
          <p>{profile.summary2}</p>
        </Reveal>
        <dl className="facts">
          {facts.map((s, i) => (
            <Reveal key={s.label} delay={0.1 + i * 0.08} className="card fact">
              <dd><Counter value={s.value} suffix={s.suffix} /></dd>
              <dt>{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  )
}
