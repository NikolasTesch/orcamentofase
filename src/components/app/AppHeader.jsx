import { NavLink } from 'react-router-dom'
import { useTheme } from '../../theme-context.js'
import { ThemeToggle } from '../../theme.jsx'
import logoBranco from '../../assets/logo-fase-branco.svg'
import logoPreto from '../../assets/logo-fase-preto.svg'

const NAV = [
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
    to: '/design-system',
    label: 'Design System',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
]

export default function AppHeader({ title, subtitle, actions }) {
  const { theme } = useTheme()
  const logo = theme === 'light' ? logoPreto : logoBranco
  return (
    <header className="app-header no-print">
      <div className="app-header__brand">
        <img src={logo} alt="Fase Esporte" />
        <div className="div" />
        <div>
          <div className="name">{title}</div>
          <div className="sub">{subtitle}</div>
        </div>
      </div>
      <nav className="app-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              {n.icon}
            </svg>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="app-header__actions">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
