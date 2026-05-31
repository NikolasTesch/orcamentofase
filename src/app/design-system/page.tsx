"use client"

import Nav from '../../components/ds/Nav'
import { ThemeToggle } from '../../context/theme'
import logoBranco from '../../assets/logo-fase-branco.svg'
import logoPreto from '../../assets/logo-fase-preto.svg'
import logoMono from '../../assets/logo-fase-mono.svg'
import logoAllWhite from '../../assets/logo-fase-allwhite.svg'
import { useTheme } from '../../context/theme-context'
import Link from 'next/link'

export default function DesignSystemPage() {
  const { theme } = useTheme()
  const currentLogo = theme === 'light' ? logoPreto : logoBranco

  return (
    <div className="ds-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Nav />
      <main className="ds-content" style={{ padding: '40px 60px', maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
        
        {/* Header da Página */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', margin: 0, letterSpacing: '-0.02em' }}>Design System</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', fontSize: 'var(--text-sm)' }}>
              Especificação visual, tokens de design e componentes da Fase Esporte.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/" className="btn btn--ghost">← Voltar ao Gerador</Link>
            <ThemeToggle />
          </div>
        </header>

        {/* 1. Marca */}
        <section id="marca" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>1. Marca</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Logotipos oficiais e emblemas em vetor otimizados para telas e mídia de impressão.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', background: '#13151a' }}>
              <img src={logoBranco.src || logoBranco} alt="Logo Fundo Escuro" style={{ height: '48px' }} />
              <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>logo-fase-branco.svg</span>
            </div>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', background: '#ffffff', color: '#0f172a' }}>
              <img src={logoPreto.src || logoPreto} alt="Logo Fundo Claro" style={{ height: '48px' }} />
              <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-mono)' }}>logo-fase-preto.svg</span>
            </div>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', background: '#262626' }}>
              <img src={logoAllWhite.src || logoAllWhite} alt="Logo Monocromática Branca" style={{ height: '48px' }} />
              <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>logo-fase-allwhite.svg</span>
            </div>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', background: '#f8fafc', color: '#0f172a' }}>
              <img src={logoMono.src || logoMono} alt="Logo Monocromática Preta" style={{ height: '48px' }} />
              <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-mono)' }}>logo-fase-mono.svg</span>
            </div>
          </div>
        </section>

        {/* 2. Cores */}
        <section id="cores" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>2. Cores</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Paleta de cores com variáveis CSS HSL dinâmicas e adaptáveis conforme o tema selecionado.</p>
          
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>Cores da Marca</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: 'var(--fase-red)', boxShadow: 'var(--shadow-glow)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Fase Red</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>--fase-red</div>
              </div>
            </div>
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: 'var(--fase-red-hover)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Red Hover</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>--fase-red-hover</div>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '32px 0 12px' }}>Cores Semânticas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: 'var(--color-success)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Success</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>--color-success</div>
              </div>
            </div>
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: 'var(--color-warning)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Warning</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>--color-warning</div>
              </div>
            </div>
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: 'var(--color-danger)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Danger</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>--color-danger</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tipografia */}
        <section id="tipografia" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>3. Tipografia</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Famílias de fontes e escala tipográfica otimizada para legibilidade técnica e apelo visual premium.</p>
          
          <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Outfit (Display, Cabeçalhos)</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Fase Esporte - 800 ExtraBold</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600 }}>Gerador de Orçamentos - 600 SemiBold</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Inter (Corpo de Texto, Rótulos)</span>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 400, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                Este projeto é uma aplicação web interativa em React e Next.js desenvolvida sob medida para a Fase Esporte.
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>JetBrains Mono (Dados Numéricos, Tabelas)</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                R$ 10.018,50 · 184 orçamentos · 501+ unidades
              </div>
            </div>
          </div>
        </section>

        {/* 4. Espaçamento & Efeitos */}
        <section id="espacamento" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>4. Espaço &amp; Efeitos</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Escala geométrica de espaçamento (base 4px), cantos arredondados e efeitos de sombreamento.</p>
          
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>Raios de Canto (Border Radius)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ height: '60px', background: 'var(--fase-red-12)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}></div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Radius SM (6px)</div>
            </div>
            <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ height: '60px', background: 'var(--fase-red-12)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}></div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Radius Base (8px)</div>
            </div>
            <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ height: '60px', background: 'var(--fase-red-12)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}></div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Radius LG (12px)</div>
            </div>
          </div>
        </section>

        {/* 5. Componentes */}
        <section id="componentes" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>5. Componentes</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Demonstração de botões, formulários e elementos interativos da interface de usuário.</p>
          
          <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Botões (Buttons)</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn--primary">Botão Primário</button>
                <button type="button" className="btn btn--ghost">Botão Ghost</button>
                <button type="button" className="btn btn--danger">Botão Danger</button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Formulários (Inputs)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="field">
                  <label>Campo de Texto</label>
                  <input className="input" placeholder="Ex.: Nome do Cliente" readOnly />
                </div>
                <div className="field">
                  <label>Campo de Seleção</label>
                  <select className="select" defaultValue="1">
                    <option value="1">Opção 01</option>
                    <option value="2">Opção 02</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Movimento */}
        <section id="movimento" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>6. Movimento</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Curvas e velocidades de transição que guiam os olhos e dão sensação de reatividade líquida.</p>
          
          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Fast Duration (--dur-fast: 150ms) - Hover padrão</span>
                <div style={{ width: '100px', height: '40px', background: 'var(--fase-red)', borderRadius: 'var(--radius)', transition: 'all var(--dur-fast) var(--ease-out)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, cursor: 'pointer' }} className="hover-demo-box">Hover</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Spring Curve (--spring: cubic-bezier(0.34, 1.56, 0.64, 1)) - Transições elásticas</span>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', position: 'relative', marginTop: '8px' }}>
                  <div style={{ position: 'absolute', left: '0', top: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--fase-red)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Impressão A4 */}
        <section id="impressao" style={{ scrollMarginTop: '80px', marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.75rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>7. Impressão A4</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Estilos de mídia de impressão otimizados para gerar PDFs formalizados de altíssima fidelidade econômica.</p>
          
          <div className="panel" style={{ padding: '24px', background: 'var(--fase-red-12)', border: '1px dashed var(--border-color-active)' }}>
            <h4 style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>Otimizações de Impressão (@media print)</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Remoção completa dos componentes interativos do vendedor (inputs, botões, abas).</li>
              <li>Alteração do fundo da folha para branco puro e texto para preto de altíssimo contraste.</li>
              <li>Ajuste automático para proporções de folha A4 vertical (retrato).</li>
              <li>Carregamento otimizado do logotipo preto para economia de toner/tinta.</li>
            </ul>
          </div>
        </section>

      </main>
    </div>
  )
}
