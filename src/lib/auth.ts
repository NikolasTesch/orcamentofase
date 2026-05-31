// Usa Web Crypto API (global em Edge Runtime e Node.js 18+) — sem import de 'crypto' Node.js

export const COOKIE_NAME = 'fase_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

function secret(): string {
  return process.env.APP_SECRET || 'fase-secret-changeme'
}

function password(): string {
  return process.env.APP_PASSWORD || 'fase2024'
}

async function computeHmac(): Promise<string> {
  const enc = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(password()))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Token stateless: HMAC(senha, secret). Válido enquanto a senha não mudar. */
export async function expectedToken(): Promise<string> {
  return computeHmac()
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const expected = await computeHmac()
    if (token.length !== expected.length) return false
    // Comparação em tempo constante (evita timing attacks)
    let diff = 0
    for (let i = 0; i < token.length; i++) {
      diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}

export async function cookieOptions(maxAge = COOKIE_MAX_AGE): Promise<string> {
  const token = await computeHmac()
  return [
    `${COOKIE_NAME}=${token}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=Lax`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}
