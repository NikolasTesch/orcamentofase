import crypto from 'crypto'

export const COOKIE_NAME = 'fase_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

function secret(): string {
  return process.env.APP_SECRET || 'fase-secret-changeme'
}

function password(): string {
  return process.env.APP_PASSWORD || 'fase2024'
}

/** Token stateless: HMAC(senha, secret). Válido enquanto a senha não mudar. */
export function expectedToken(): string {
  return crypto.createHmac('sha256', secret()).update(password()).digest('hex')
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken()))
  } catch {
    return false
  }
}

export function cookieOptions(maxAge = COOKIE_MAX_AGE) {
  return [
    `${COOKIE_NAME}=${expectedToken()}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=Lax`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}
