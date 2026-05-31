import type { Metadata, Viewport } from 'next'
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google'
import ClientLoader from '../components/ClientLoader'
import { ThemeProvider } from '../theme'

import '../styles/fase-tokens.css'
import '../styles/fase-guide.css'
import '../styles/fase-components.css'
import '../styles/app.css'
import '../styles/admin.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Gerador de Orçamentos — Fase Esporte',
  description: 'Sistema interativo de configuração de uniformes, camisas de malha, sublimação total e linha social. Gere orçamentos instantâneos em formato A4/PDF.',
  keywords: 'Fase Esporte, Teixeira de Freitas, orçamentos, uniformes esportivos, sublimação, camisas de malha, camisas promocionais, abadás, confecção',
  authors: [{ name: 'Fase Esporte' }],
  robots: {
    index: false, // Área administrativa interna para vendedores
    follow: false,
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      data-theme="dark"
    >
      <body>
        <ThemeProvider>
          <ClientLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
