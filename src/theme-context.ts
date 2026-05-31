import { createContext, useContext } from 'react'

export interface ThemeContextValue {
  theme: string
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}
