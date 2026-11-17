import { motion } from 'framer-motion'
import { profile } from '../data.js'

export default function Loader() {
  return (
    <motion.div
      className="loader"
      exit={{ clipPath: 'circle(0% at 50% 50%)', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      initial={{ clipPath: 'circle(150% at 50% 50%)' }}
    >
      <div className="loader-inner">
        <svg viewBox="0 0 120 120" className="loader-ring">
          <motion.circle
            cx="60" cy="60" r="52"
            fill="none" stroke="url(#lg)" strokeWidth="4" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <motion.span
          className="loader-initials"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {profile.initials}
        </motion.span>
      </div>
    </motion.div>
  )
}
