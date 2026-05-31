"use client"

import { useEffect, useState, MouseEvent } from 'react'
import { useTheme } from '../../theme-context'
import logoBranco from '../../assets/logo-fase-branco.svg'
import logoPreto from '../../assets/logo-fase-preto.svg'

interface NavItem {
  id: string
  label: string
  icon: JSX.Element
}

const NAV_ITEMS: NavItem[] = [
  { id: 'marca', label: 'Marca', icon: <><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></> },
  { id: 'cores', label: 'Cores', icon: <><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="19" cy="13" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="10" cy="20" r="2.5" /></> },
  { id: 'tipografia', label: 'Tipografia', icon: <path d="M4 7V4h16v3M9 20h6M12 4v16" /> },
  { id: 'espacamento', label: 'Espaço & Efeitos', icon: <path d="M3 3v18h18M7 16l4-4 4 3 5-6" /> },
  { id: 'componentes', label: 'Componentes', icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></> },
  { id: 'movimento', label: 'Movimento', icon: <path d="m5 3 14 9-14 9V3Z" /> },
  { id: 'impressao', label: 'Impressão A4', icon: <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6Z" /> },
]

export default function Nav() {
  const { theme } = useTheme()
  const logo = theme === 'light' ? logoPreto : logoBranco
  const [active, setActive] = useState('marca')

  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null)
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    )
    sections.forEach((s) => spy.observe(s))
    return () => spy.disconnect()
  }, [])

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const t = document.getElementById(id)
    if (t) window.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' })
  }

  return (
    <aside className="nav">
      <div className="nav__logo">
        <img src={logo.src || logo} alt="Fase Esporte" />
      </div>
      <p className="nav__tag">Design System</p>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={active === item.id ? 'active' : undefined}
          onClick={(e) => handleClick(e, item.id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {item.icon}
          </svg>
          <span>{item.label}</span>
        </a>
      ))}
    </aside>
  )
}
