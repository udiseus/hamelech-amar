'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  count: number
  updatedAt: string
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
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  })
}

export default function Counter({ count, updatedAt }: CounterProps) {
  const [displayCount, setDisplayCount] = useState(0)
  const [pop, setPop] = useState(false)
  const prevCount = useRef(0)

  useEffect(() => {
    if (count === prevCount.current) return
    prevCount.current = count

    // Animate count-up from 0 on first load, or +1 on update
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
    <section className="card text-center py-10 px-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
      <p className="text-lg md:text-xl" style={{ color: 'var(--purple-pale)' }}>
        ברק רביד כתב &ldquo;טראמפ אמר לי&rdquo; כבר
      </p>

      <div className={`my-4 ${pop ? 'count-pop' : ''}`}>
        <span
          className="font-black"
          style={{
            fontSize: 'clamp(96px, 20vw, 160px)',
            color: 'var(--gold)',
            lineHeight: 1,
            textShadow: '0 0 40px rgba(226,201,126,0.4)',
            display: 'block',
          }}
        >
          {displayCount}
        </span>
      </div>

      <p className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
        פעמים
      </p>

      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        עודכן לאחרונה: {formatUpdatedAt(updatedAt)}
      </p>
    </section>
  )
}
