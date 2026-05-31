import { createContext, useContext } from 'react'

/* Contexto de tema isolado dos componentes para manter o fast-refresh feliz
   (um arquivo de componentes deve exportar apenas componentes). */
export const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}
