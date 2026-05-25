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
    <section className="card" style={{ textAlign: 'center' }}>

      <h2 className="font-title" style={{
        fontSize: 'clamp(22px, 5vw, 32px)',
        fontWeight: 900,
        color: 'var(--accent)',
        letterSpacing: '-0.02em',
        marginBottom: '0.5rem',
      }}>
        רוצה לדעת כשהמלך אומר לו שוב?
      </h2>

      {status === 'success' ? (
        <div style={{
          padding: '1rem',
          borderRadius: 12,
          background: 'rgba(30,106,168,0.1)',
          color: 'var(--accent)',
          border: '1px solid rgba(30,106,168,0.3)',
          fontFamily: 'Heebo, sans-serif',
          fontWeight: 500,
        }}>
          ✓ {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="email"
            placeholder="האימייל שלך"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            style={{
              flex: '1 1 220px',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 15,
              outline: 'none',
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid rgba(30,106,168,0.35)',
              color: 'var(--text-main)',
              fontFamily: 'Heebo, sans-serif',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary"
            style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 600 }}
          >
            {status === 'loading' ? '...' : 'אני חייב.ת לדעת'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b', fontFamily: 'Heebo, sans-serif' }}>{message}</p>
      )}

      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Heebo, sans-serif', fontWeight: 300, background: 'none' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 4 }}>⁕</span>
        נשלח מייל רק כשטראמפ יגיד לו שוב. לא נציק, נודרים.
      </p>
    </section>
  )
}
