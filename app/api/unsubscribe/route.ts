import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(new URL('/?unsubscribed=error', req.url))
  }

  const supabaseAdmin = getSupabaseAdmin()

  await supabaseAdmin
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim())

  return NextResponse.redirect(new URL('/?unsubscribed=true', req.url))
}
