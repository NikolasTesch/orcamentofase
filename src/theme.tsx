"use client"

import { useCallback, useEffect, useState, ReactNode } from 'react'
import { ThemeContext, useTheme } from './theme-context'

/* ============================================================
   Tema (escuro padrão / claro alternável) + acento de marca.
   Porta o comportamento de fase-guide.js para React.
   ============================================================ */

function readInitialTheme(): string {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fase-theme') || 'dark'
    }
  } catch {
    /* localStorage indisponível */
  }
  return 'dark'
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>('dark') // Padrão 'dark' no SSR para evitar flashes indesejados.

  useEffect(() => {
    // Sincroniza o tema inicial após a hidratação no cliente.
    setTheme(readInitialTheme())
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('fase-theme', theme)
    } catch {
      /* localStorage indisponível — segue só em memória */
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

/* ---------- Ícones sol/lua ---------- */
const SunIcon = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
)
const MoonIcon = <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <button className="theme-toggle" id="themeToggle" onClick={toggle}>
      <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        {isLight ? MoonIcon : SunIcon}
      </svg>
      <span id="themeLabel">{isLight ? 'Modo escuro' : 'Modo claro'}</span>
    </button>
  )
}

/* ---------- Trocadores de acento de marca ---------- */
interface Accent {
  c: string
  hover: string
  title: string
}

const ACCENTS: Accent[] = [
  { c: '#AF0608', hover: '#D90429', title: 'Fase RED' },
  { c: '#D90429', hover: '#F11D3B', title: 'Carmim' },
  { c: '#E11D48', hover: '#F43F5E', title: 'Rosa intenso' },
]

export function AccentSwatches() {
  const [active, setActive] = useState<string | null>(null)

  const apply = useCallback((accent: Accent) => {
    const root = document.documentElement
    const { c, hover } = accent
    const rgb = c.match(/\w\w/g)?.map((h) => parseInt(h, 16))
    if (!rgb) return
    root.style.setProperty('--fase-red', c)
    root.style.setProperty('--fase-red-hover', hover)
    root.style.setProperty('--fase-red-12', `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.12)`)
    root.style.setProperty('--fase-red-15', `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.15)`)
    root.style.setProperty('--fase-red-glow', `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`)
    root.style.setProperty('--border-color-active', `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`)
    root.style.setProperty('--shadow-glow', `0 0 15px rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`)
    root.style.setProperty('--shadow-glow-soft', `0 0 10px rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.15)`)
    setActive(c)
  }, [])

  return (
    <div className="row" id="accentSwatches" style={{ gap: 6 }}>
      {ACCENTS.map((a) => (
        <button
          key={a.c}
          className={`accent-dot${active === a.c ? ' active' : ''}`}
          style={{ background: a.c }}
          title={a.title}
          onClick={() => apply(a)}
        />
      ))}
    </div>
  )
}
