"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../../theme-context'
import { ThemeToggle } from '../../theme'
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
]

interface AppHeaderProps {
  maxWidth?: 'standard' | 'wide'
}

export default function AppHeader({ maxWidth = 'wide' }: AppHeaderProps) {
  const { theme } = useTheme()
  const logo = theme === 'light' ? logoPreto : logoBranco
  const pathname = usePathname() || '/'

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
        </div>
      </div>
    </header>
  )
}
