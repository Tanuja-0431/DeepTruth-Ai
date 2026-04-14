import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform, motion, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
}

export default function AnimatedCounter({ 
  from, 
  to, 
  duration = 2, 
  decimals = 0, 
  prefix = '', 
  suffix = '' 
}: AnimatedCounterProps) {
  const count = useMotionValue(from)
  const rounded = useTransform(count, (latest) => 
    `${prefix}${latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`
  )
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] })
      return controls.stop
    }
  }, [inView, count, to, duration])

  return (
    <motion.h2 ref={ref} style={{ display: 'inline' }}>
      {rounded}
    </motion.h2>
  )
}
