import { motion } from 'framer-motion'

export function Reveal({ children, delay = 0, y = 50, className, as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ kicker, title }) {
  return (
    <div className="section-title">
      <Reveal><span className="kicker">{kicker}</span></Reveal>
      <Reveal delay={0.1}><h2>{title}</h2></Reveal>
      <motion.div
        className="title-line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
