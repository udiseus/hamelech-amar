import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOwnerNotification } from '@/lib/email'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/?confirmed=error', req.url))
  }

  const supabaseAdmin = getSupabaseAdmin()

  // Find subscriber by token first
  const { data: subscriber } = await supabaseAdmin
    .from('subscribers')
    .select('id, email')
    .eq('confirmation_token', token)
    .single()

  if (!subscriber) {
    return NextResponse.redirect(new URL('/?confirmed=error', req.url))
  }

  // Update by ID — avoids the complex chained-update typing issue
  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({ confirmed: true, confirmation_token: null })
    .eq('id', subscriber.id)

  if (error) {
    return NextResponse.redirect(new URL('/?confirmed=error', req.url))
  }

  // Notify owner — fire and forget, don't block the redirect
  sendOwnerNotification(subscriber.email).catch((err) =>
    console.error('[confirm] owner notification failed:', err)
  )

  return NextResponse.redirect(new URL('/?confirmed=true', req.url))
}
