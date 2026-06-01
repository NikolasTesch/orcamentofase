"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import PageLayout from '../../components/app/PageLayout'
import PageHeader from '../../components/app/PageHeader'
import { editSchema, getPB, updatePBFromServer, EditSection } from '../../data/pricebook'

const KIND_LABEL: Record<string, string> = {
  kit: 'Kit',
  esportivo: 'Esportivo',
  promocional: 'Promocional',
  abada: 'Abadá · isento de parceria',
}

const num = (n: any) => (Number.isInteger(n) ? n : (n + '').replace('.', ','))

interface NumCellProps {
  group: string
  defaultValue: any
  onChange: (val: string) => void
}

function NumCell({ group, defaultValue, onChange }: NumCellProps) {
  const pre = group === 'tamM2' ? '' : 'R$'
  return (
    <div className="pe-num">
      {pre && <span className="pre">{pre}</span>}
      <input
        className="pe-input"
        type="text"
        inputMode="decimal"
        defaultValue={num(defaultValue)}
        onChange={(e) => {
          e.target.classList.add('changed')
          onChange(e.target.value.replace(',', '.'))
        }}
      />
    </div>
  )
}

// Mapa de patches pendentes: catId.group.keyPath -> { groupId, subKey, bracketId, value }
type PricePatch = { groupId: string; subKey: string | null; bracketId: string | null; value: number }

export default function PricesPage() {
  const [loading, setLoading] = useState(true)
  const [groupMap, setGroupMap] = useState<Record<string, any>>({}) // catKey.groupKey -> group with id
  const [rev, setRev] = useState(0)
  const schema = useMemo(() => editSchema(), [rev])
  const [active, setActive] = useState(schema[0]?.catId || '')
  const [dirty, setDirty] = useState(false)
  const [pendingPatches, setPendingPatches] = useState<PricePatch[]>([])
  const [toast, setToast] = useState({ show: false, text: 'Alterações salvas' })
  const detailRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadPricebook()
  }, [])

  async function loadPricebook() {
    setLoading(true)
    try {
      const [pbRes, groupRes] = await Promise.all([
        fetch('/api/pricebook').then((r) => r.json()),
        fetch('/api/pricebook/groups').then((r) => r.json()).catch(() => ({ success: false })),
      ])
      if (pbRes.success && pbRes.data) {
        updatePBFromServer(pbRes.data)
        setRev((r) => r + 1)
      }
      if (groupRes.success && groupRes.data) {
        setGroupMap(groupRes.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const cat = schema.find((c) => c.catId === active)
  const pb = cat ? getPB()[cat.catId] : null

  const touch = (catId: string, group: string, path: any, value: string) => {
    const v = parseFloat(value)
    if (isNaN(v)) return
    // Atualiza memória local via pricebook in-memory (para exibição imediata)
    const node = getPB()[catId]?.[group]
    if (node) {
      if (Array.isArray(node)) node[path] = v
      else if (Array.isArray(path) && Array.isArray(node[path[0]])) node[path[0]][path[1]] = v
      else node[path] = v
    }
    setDirty(true)

    // Acumula patch para envio ao banco
    const gData = groupMap[`${catId}.${group}`]
    if (gData) {
      const patch: PricePatch = { groupId: gData.id, subKey: null, bracketId: null, value: v }
      if (Array.isArray(path)) {
        patch.subKey = path[0]
        patch.bracketId = gData.bracketIds?.[path[1]] || null
      } else if (typeof path === 'number') {
        patch.bracketId = gData.bracketIds?.[path] || null
      } else {
        patch.subKey = path
      }
      setPendingPatches((prev) => {
        const idx = prev.findIndex((p) => p.groupId === patch.groupId && p.subKey === patch.subKey && p.bracketId === patch.bracketId)
        if (idx >= 0) return prev.map((p, i) => (i === idx ? patch : p))
        return [...prev, patch]
      })
    }
  }

  const flashToast = (text: string) => {
    setToast({ show: true, text })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 1900)
  }

  const onSave = async () => {
    try {
      for (const patch of pendingPatches) {
        await fetch('/api/pricebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
      }
      setPendingPatches([])
      setDirty(false)
      detailRef.current?.querySelectorAll('.pe-input.changed').forEach((i) => i.classList.remove('changed'))
      flashToast('Alterações salvas no banco')
    } catch {
      flashToast('Erro de conexão ao salvar no banco')
    }
  }

  const onReset = async () => {
    if (!window.confirm('Restaurar todos os preços para o padrão? As alterações salvas serão perdidas.')) return
    try {
      await fetch('/api/pricebook', { method: 'DELETE' })
      await loadPricebook()
      setPendingPatches([])
      setDirty(false)
      setRev((r) => r + 1)
      flashToast('Preços restaurados ao padrão')
    } catch {
      flashToast('Erro ao restaurar preços')
    }
  }

  if (loading) {
    return (
      <PageLayout maxWidth="wide">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <span style={{ color: 'var(--text-muted)' }}>Carregando tabela de preços...</span>
        </div>
      </PageLayout>
    )
  }

  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Restaurar padrão
      </button>
      <button type="button" className={`btn btn--primary${!dirty ? ' btn--disabled' : ''}`} onClick={onSave} disabled={!dirty}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3h11l3 3v15H5V3Z" />
          <path d="M8 3v6h7M8 21v-7h8v7" />
        </svg>
        {pendingPatches.length > 0 ? `Salvar (${pendingPatches.length})` : 'Salvar alterações'}
      </button>
    </>
  )

  if (!cat || !pb) return null

  return (
    <PageLayout maxWidth="wide">
      <div className="admin-body">
        <PageHeader
          title="Tabela de preços"
          subtitle="Ajuste valores base por faixa de volume, acréscimos de gola/tecido e opcionais. As alterações são salvas no banco de dados."
          eyebrow="Administração · preços 2024"
          actions={actions}
        />

        <div className="pe-layout">
          <div className="pe-side">
            {schema.map((c) => {
              const fields = c.sections.reduce(
                (n, s) => n + (s.type === 'matrix' ? (s.rows?.length || 0) * (s.cols?.length || 0) : s.type === 'row' ? (s.cols?.length || 0) : (s.items?.length || 0)),
                0,
              )
              return (
                <button
                  key={c.catId}
                  type="button"
                  className={`pe-cat${c.catId === active ? ' active' : ''}`}
                  onClick={() => setActive(c.catId)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d={c.icon} />
                  </svg>
                  <span>{c.label}</span>
                  <span className="badge">{fields}</span>
                </button>
              )
            })}
          </div>

          <div className="pe-detail" ref={detailRef} key={`${cat.catId}-${rev}`}>
            <div className="pe-cat-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 24, height: 24, color: 'var(--fase-red)' }}>
                <path d={cat.icon} />
              </svg>
              <h2>{cat.label}</h2>
              <span className="tag tag--partner">{KIND_LABEL[cat.kind]}</span>
            </div>

            {cat.sections.map((sec: EditSection) => (
              <div className="panel" key={sec.group}>
                <div className="pe-section__title">{sec.title}</div>

                {sec.type === 'matrix' && (
                  <>
                    <div className="pe-section__sub">Valores em R$ por unidade, conforme a faixa de quantidade.</div>
                    <table className="pe-matrix">
                      <thead>
                        <tr>
                          <th>Item</th>
                          {sec.cols?.map((c2) => <th key={c2}>{c2}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {sec.rows?.map((row) => (
                          <tr key={row.key}>
                            <td>{row.label}</td>
                            {sec.cols?.map((_, b) => (
                              <td key={b}>
                                <NumCell
                                  group={sec.group}
                                  defaultValue={pb[sec.group]?.[row.key]?.[b]}
                                  onChange={(v) => touch(cat.catId, sec.group, [row.key, b], v)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {sec.type === 'row' && (
                  <>
                    <div className="pe-section__sub">Valor base em R$ por unidade, conforme a faixa de quantidade.</div>
                    <table className="pe-matrix">
                      <thead>
                        <tr>
                          <th>Faixa</th>
                          {sec.cols?.map((c2) => <th key={c2}>{c2}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Preço base</td>
                          {sec.cols?.map((_, b) => (
                            <td key={b}>
                              <NumCell
                                group={sec.group}
                                defaultValue={pb[sec.group]?.[b]}
                                onChange={(v) => touch(cat.catId, sec.group, b, v)}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {sec.type === 'list' && (
                  <div className="pe-list">
                    {sec.items?.map((it) => (
                      <div className="pe-field" key={it.key}>
                        <label>{it.label}</label>
                        <NumCell
                          group={sec.group}
                          defaultValue={pb[sec.group]?.[it.key]}
                          onChange={(v) => touch(cat.catId, sec.group, it.key, v)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`saved-toast${toast.show ? ' show' : ''}`}>{toast.text}</div>
    </PageLayout>
  )
}
