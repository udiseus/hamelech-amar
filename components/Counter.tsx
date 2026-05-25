'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  count: number
  updatedAt: string
  color?: string
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'עכשיו'
  if (diffMins < 60) return `לפני ${diffMins} דקות`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `לפני ${diffHrs} שעות`
  return d.toLocaleString('he-IL', {
    day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  })
}

export default function Counter({ count, updatedAt, color }: CounterProps) {
  const [displayCount, setDisplayCount] = useState(0)
  const [pop, setPop] = useState(false)
  const prevCount = useRef(0)

  useEffect(() => {
    if (count === prevCount.current) return
    prevCount.current = count
    const start = displayCount
    const end = count
    const duration = 800
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayCount(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
      else {
        setDisplayCount(end)
        setPop(true)
        setTimeout(() => setPop(false), 400)
      }
    }
    requestAnimationFrame(step)
  }, [count])

  return (
    <section className="card text-center fade-in-up" style={{ animationDelay: '0.1s', padding: '2rem 1.5rem 1.5rem' }}>
      <p style={{
        fontFamily: 'Heebo, sans-serif',
        fontWeight: 400,
        fontSize: 'clamp(15px, 3vw, 18px)',
        color: 'var(--text-muted)',
        marginBottom: '0.1rem',
      }}>
        ברק רביד כתב &ldquo;טראמפ אמר לי&rdquo; כבר
      </p>

      <div className={pop ? 'count-pop' : ''} style={{ lineHeight: 1, margin: '0.1rem 0' }}>
        <span
          className="font-title"
          style={{
            fontSize: 'clamp(100px, 22vw, 164px)',
            fontWeight: 900,
            color: color ?? 'var(--gold)',
            lineHeight: 1,
            textShadow: `0 0 40px ${color ?? 'rgba(176,128,16,0.3)'}44`,
            display: 'block',
          }}
        >
          {displayCount}
        </span>
      </div>

      <p className="font-title" style={{
        fontSize: 'clamp(22px, 5vw, 30px)',
        fontWeight: 700,
        color: 'var(--text-main)',
        marginBottom: '1rem',
        marginTop: '0.1rem',
      }}>
        פעמים
      </p>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Heebo, sans-serif', fontWeight: 300 }}>
        נבדק נאחרונה: {formatUpdatedAt(updatedAt)}
      </p>
    </section>
  )
}
