"use client"

import { motion } from 'framer-motion'
import { CATEGORIES, Category } from '../../data/pricebook'
import { useBudget } from '../../context/budget-context'

/* Abas de categoria com indicador líquido (framer-motion layoutId · spring). */
export default function CategoryTabs() {
  const { activeCat, setActiveCat } = useBudget()
  return (
    <div className="tabs cat-tabs" style={{ position: 'relative' }}>
      {CATEGORIES.map((c: Category) => (
        <button
          key={c.id}
          type="button"
          className={`tab-btn${activeCat === c.id ? ' active' : ''}`}
          onClick={() => setActiveCat(c.id)}
        >
          {activeCat === c.id && (
            <motion.span
              layoutId="catTabIndicator"
              className="tab-indicator"
              style={{ inset: 0, width: 'auto', height: 'auto' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d={c.icon} />
          </svg>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  )
}
