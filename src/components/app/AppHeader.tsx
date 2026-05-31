"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '../../context/theme-context'
import { ThemeToggle } from '../../context/theme'
import logoBranco from '../../assets/logo-fase-branco.svg'
import logoPreto from '../../assets/logo-fase-preto.svg'
import { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const NAV: NavItem[] = [
  {
    to: '/',
    label: 'Gerador',
    icon: <path d="M5 12h14M12 5v14" />,
  },
  {
    to: '/metricas',
    label: 'Métricas',
    icon: <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />,
  },
  {
    to: '/tabela',
    label: 'Tabela de preços',
    icon: <path d="M3 6h18M3 12h18M3 18h18M8 3v18" />,
  },
  {
    to: '/tamanhos',
    label: 'Grade de tamanhos',
    icon: <path d="M2 9h20v6H2zm4 0v3m4-3v6m4-6v3m4-3v6" strokeWidth="2" strokeLinecap="round" />,
  },
  {
    to: '/historico',
    label: 'Histórico',
    icon: <><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /></>,
  },
  {
    to: '/configuracoes',
    label: 'Configurações',
    icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>,
  },
]

interface AppHeaderProps {
  maxWidth?: 'standard' | 'wide'
}

export default function AppHeader({ maxWidth = 'wide' }: AppHeaderProps) {
  const { theme } = useTheme()
  const logo = theme === 'light' ? logoPreto : logoBranco
  const pathname = usePathname() || '/'
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  return (
    <header className="app-header no-print">
      <div className={`app-header__container max-w-${maxWidth}`}>
        <div className="app-header__brand">
          <img src={logo.src || logo} alt="Fase Esporte" />
          <div className="div" />
          <div>
            <div className="name">Fase Esporte</div>
            <div className="sub">Teixeira de Freitas — BA</div>
          </div>
        </div>
        <nav className="app-nav">
          {NAV.map((n) => {
            const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)
            return (
              <Link key={n.to} href={n.to} className={active ? 'active' : undefined}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  {n.icon}
                </svg>
                <span>{n.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="app-header__actions">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleLogout}
            title="Sair"
            style={{ padding: '6px 10px', gap: 6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 16, height: 16 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span style={{ fontSize: 13 }}>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
