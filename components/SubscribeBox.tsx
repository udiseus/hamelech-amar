'use client'

import { useState } from 'react'

export default function SubscribeBox() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'שגיאה. נסו שוב.')
      }
    } catch {
      setStatus('error')
      setMessage('שגיאת רשת. נסו שוב.')
    }
  }

  return (
    <section className="card fade-in-up" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-xl font-bold gold-text mb-2">
        👑 רוצים לדעת כשהמלך אומר שוב?
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        השאירו מייל ונעדכן אתכם בכל פעם שברק כותב שוב את המשפט הקדוש.
      </p>

      {status === 'success' ? (
        <div
          className="text-center py-4 rounded-xl font-medium"
          style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--purple-pale)', border: '1px solid var(--purple-bright)' }}
        >
          ✓ {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
          <input
            type="email"
            placeholder="האימייל שלך"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1 min-w-[200px] rounded-xl px-4 py-3 text-base outline-none transition-all"
            style={{
              background: 'var(--bg-card2)',
              border: '1px solid var(--purple-bright)',
              color: 'var(--text-main)',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? '...' : 'עדכנו אותי'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="mt-2 text-sm" style={{ color: '#f87171' }}>{message}</p>
      )}

      <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        נשלח מייל רק כשנספור ציוץ חדש. לא נציק — המלך עושה את זה בשבילנו.
      </p>
    </section>
  )
}
