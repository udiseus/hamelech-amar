'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Silently refresh the page every 5 minutes to pick up new tweet counts
export default function LiveRefresh() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [router])

  return null
}
