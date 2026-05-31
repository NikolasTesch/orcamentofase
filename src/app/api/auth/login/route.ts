import { NextResponse } from 'next/server'
import { cookieOptions } from '../../../../lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()
  const expected = process.env.APP_PASSWORD || 'fase2024'

  if (password !== expected) {
    return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.headers.set('Set-Cookie', await cookieOptions())
  return res
}
