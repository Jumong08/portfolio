import { useState } from 'react'
import { profile } from '../data.js'
import Section from './Section.jsx'
import Reveal from './Reveal.jsx'

export default function Contact() {
  const [copied, setCopied] = useState('')
  const copy = async (label, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); setTimeout(() => setCopied(''), 1500) } catch { /* ignore */ }
  }

  const items = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
    { label: 'Location', value: profile.location },
  ]

  return (
    <Section id="contact" eyebrow="Contact" title="Let's work together">
      <Reveal className="card contact-card">
        <div>
          <p className="contact-text">
            I'm open to discussing new roles and projects in full stack, .NET, React and cloud development.
          </p>
          <a href={`mailto:${profile.email}`} className="btn btn-primary">Send an email <span className="arrow">→</span></a>
        </div>
        <dl className="contact-list">
          {items.map((it) => (
            <div key={it.label} className="contact-item">
              <dt>{it.label}</dt>
              <dd>
                {it.href ? <a href={it.href}>{it.value}</a> : it.value}
                {it.href && (
                  <button className="link-btn copy" onClick={() => copy(it.label, it.value)}>
                    {copied === it.label ? 'Copied' : 'Copy'}
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  )
}
