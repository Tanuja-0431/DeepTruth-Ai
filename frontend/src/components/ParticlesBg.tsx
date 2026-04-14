import { useMemo } from 'react'

export default function ParticlesBg() {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 5 + 3,          // 3–8 px  (was 1–4 px)
      duration: Math.random() * 8 + 6,      // 6–14 s  (shorter = snappier float)
      delay: Math.random() * 8,
      opacity: Math.random() * 0.35 + 0.55, // 0.55–0.9 (was 0.1–0.5)
      color: i % 2 === 0 ? 'cyan' : 'purple',
    })), []
  )

  return (
    <div className="particles-bg">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${p.color}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
