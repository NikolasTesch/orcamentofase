import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '../../../../lib/auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`)
  return res
}
