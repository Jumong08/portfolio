import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Animated gradient blobs, a subtle grid, a particle network and a cursor-follow glow.
export default function Background() {
  const x = useMotionValue(-500)
  const y = useMotionValue(-500)
  const sx = useSpring(x, { stiffness: 80, damping: 20 })
  const sy = useSpring(y, { stiffness: 80, damping: 20 })
  const canvasRef = useRef(null)

  useEffect(() => {
    const move = (e) => { x.set(e.clientX - 250); y.set(e.clientY - 250) }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, raf
    let pts = []
    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      const n = Math.min(70, Math.floor((w * h) / 22000))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.fillStyle = 'rgba(167,139,250,0.55)'
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2); ctx.fill()
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d < 130) {
            ctx.strokeStyle = `rgba(56,189,248,${0.12 * (1 - d / 130)})`
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke()
          }
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    resize(); draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-grid" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <canvas ref={canvasRef} className="bg-canvas" />
      <motion.div className="cursor-glow" style={{ x: sx, y: sy }} />
      <div className="noise" />
    </div>
  )
}
