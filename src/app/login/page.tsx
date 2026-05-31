"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import logoBranco from '../../assets/logo-fase-branco.svg'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') || '/'

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.replace(from)
    } else {
      const r = await res.json()
      setError(r.error || 'Senha incorreta')
      setPassword('')
      inputRef.current?.focus()
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <img
            src={logoBranco.src || logoBranco}
            alt="Fase Esporte"
            style={{ height: 48, objectFit: 'contain' }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Gerador de Orçamentos
            </div>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Acesso restrito
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Digite a senha da equipe Fase Esporte para continuar.
            </p>
          </div>

          <div className="field" style={{ gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Senha
            </label>
            <input
              ref={inputRef}
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              style={{ fontSize: 15, letterSpacing: '0.1em' }}
            />
            {error && (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block btn--lg"
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }}>
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
                Verificando…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Entrar
              </>
            )}
          </button>
        </form>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Fase Esporte · Teixeira de Freitas — BA
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
