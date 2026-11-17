import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { profile, stats } from '../data.js'
import { Reveal, SectionTitle } from './Reveal.jsx'

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 2, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  return <span ref={ref}>{n}{suffix}</span>
}

export default function About() {
  return (
    <section id="about" className="section">
      <SectionTitle kicker="01 · About me" title="Building software that businesses run on" />
      <div className="about-grid">
        <Reveal className="glass about-card">
          <div className="code-head">
            <span className="dot r" /><span className="dot y" /><span className="dot g" />
            <span className="file">about.cs</span>
          </div>
          <pre className="code">
<span className="k">public class</span> <span className="t">Developer</span> {'{'}{'\n'}
{'  '}<span className="k">public string</span> Name = <span className="s">"{profile.name}"</span>;{'\n'}
{'  '}<span className="k">public string</span> Role = <span className="s">"{profile.title}"</span>;{'\n'}
{'  '}<span className="k">public int</span> Years = <span className="n">9</span>;{'\n'}
{'  '}<span className="k">public string</span>[] Stack = {'{'} <span className="s">".NET"</span>, <span className="s">"React"</span>, <span className="s">"Azure"</span> {'}'};{'\n'}
{'}'}
          </pre>
          <p>{profile.summary}</p>
          <p>{profile.summary2}</p>
        </Reveal>
        <div className="stats">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="glass stat">
              <div className="stat-value gradient-text"><Counter value={s.value} suffix={s.suffix} /></div>
              <div className="stat-label">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
