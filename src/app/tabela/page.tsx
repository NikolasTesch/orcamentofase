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

function LabelCell({ defaultValue, onChange }: { defaultValue: string; onChange: (v: string) => void }) {
  return (
    <input
      className="pe-label-input"
      type="text"
      defaultValue={defaultValue}
      title="Editar nome do item"
      onChange={(e) => {
        e.target.classList.add('changed')
        onChange(e.target.value)
      }}
    />
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  )
}

type PricePatch =
  | { kind: 'price'; groupId: string; subKey: string | null; bracketId: string | null; value: number }
  | { kind: 'label'; groupId: string; subKey: string; label: string }

export default function PricesPage() {
  const [loading, setLoading] = useState(true)
  const [groupMap, setGroupMap] = useState<Record<string, any>>({})
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
        updatePBFromServer(pbRes.data, pbRes.labels || {})
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
    const node = getPB()[catId]?.[group]
    if (node) {
      if (Array.isArray(node)) node[path] = v
      else if (Array.isArray(path) && Array.isArray(node[path[0]])) node[path[0]][path[1]] = v
      else node[path] = v
    }
    setDirty(true)

    const gData = groupMap[`${catId}.${group}`]
    if (gData) {
      const patch: PricePatch = { kind: 'price', groupId: gData.id, subKey: null, bracketId: null, value: v }
      if (Array.isArray(path)) {
        patch.subKey = path[0]
        patch.bracketId = gData.bracketIds?.[path[1]] || null
      } else if (typeof path === 'number') {
        patch.bracketId = gData.bracketIds?.[path] || null
      } else {
        patch.subKey = path
      }
      setPendingPatches((prev) => {
        const idx = prev.findIndex((p) => p.kind === 'price' && p.groupId === patch.groupId && p.subKey === patch.subKey && p.bracketId === patch.bracketId)
        if (idx >= 0) return prev.map((p, i) => (i === idx ? patch : p))
        return [...prev, patch]
      })
    }
  }

  const touchLabel = (catId: string, group: string, subKey: string, label: string) => {
    setDirty(true)
    const gData = groupMap[`${catId}.${group}`]
    if (!gData) return
    const patch: PricePatch = { kind: 'label', groupId: gData.id, subKey, label }
    setPendingPatches((prev) => {
      const idx = prev.findIndex((p) => p.kind === 'label' && p.groupId === gData.id && p.subKey === subKey)
      if (idx >= 0) return prev.map((p, i) => (i === idx ? patch : p))
      return [...prev, patch]
    })
  }

  const onDeleteEntry = async (catId: string, group: string, subKey: string, label: string) => {
    if (!confirm(`Remover "${label}" permanentemente da tabela de preços?\n\nEsta ação não pode ser desfeita.`)) return
    const gData = groupMap[`${catId}.${group}`]
    if (!gData) return
    try {
      await fetch('/api/pricebook/entry', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: gData.id, subKey }),
      })
      await loadPricebook()
      setPendingPatches([])
      setDirty(false)
      flashToast('Item removido')
    } catch {
      flashToast('Erro ao remover item')
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
      detailRef.current?.querySelectorAll('.pe-input.changed, .pe-label-input.changed').forEach((i) => i.classList.remove('changed'))
      flashToast('Alterações salvas no banco')
    } catch {
      flashToast('Erro de conexão ao salvar no banco')
    }
  }

  const onReset = async () => {
    if (!window.confirm('Restaurar todos os preços e nomes para o padrão? As alterações salvas serão perdidas.')) return
    try {
      await fetch('/api/pricebook', { method: 'DELETE' })
      await loadPricebook()
      setPendingPatches([])
      setDirty(false)
      setRev((r) => r + 1)
      flashToast('Preços e nomes restaurados ao padrão')
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

  const patchCount = pendingPatches.length
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
        {patchCount > 0 ? `Salvar (${patchCount})` : 'Salvar alterações'}
      </button>
    </>
  )

  if (!cat || !pb) return null

  return (
    <PageLayout maxWidth="wide">
      <div className="admin-body">
        <PageHeader
          title="Tabela de preços"
          subtitle="Edite preços e nomes dos itens. Clique no nome para renomear, no lixo para remover um item."
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
                    <div className="pe-section__sub">Valores em R$ por unidade, conforme a faixa de quantidade. Clique no nome para renomear.</div>
                    <table className="pe-matrix">
                      <thead>
                        <tr>
                          <th>Item</th>
                          {sec.cols?.map((c2) => <th key={c2}>{c2}</th>)}
                          <th style={{ width: 32 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.rows?.map((row) => (
                          <tr key={row.key}>
                            <td className="pe-matrix__label-cell">
                              <div className="pe-matrix__label-row">
                                <LabelCell
                                  defaultValue={row.label}
                                  onChange={(v) => touchLabel(cat.catId, sec.group, row.key, v)}
                                />
                              </div>
                            </td>
                            {sec.cols?.map((_, b) => (
                              <td key={b}>
                                <NumCell
                                  group={sec.group}
                                  defaultValue={pb[sec.group]?.[row.key]?.[b]}
                                  onChange={(v) => touch(cat.catId, sec.group, [row.key, b], v)}
                                />
                              </td>
                            ))}
                            <td>
                              <button
                                type="button"
                                className="pe-delete-btn"
                                title={`Remover ${row.label}`}
                                onClick={() => onDeleteEntry(cat.catId, sec.group, row.key, row.label)}
                              >
                                <TrashIcon />
                              </button>
                            </td>
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
                        <div className="pe-field__head">
                          <LabelCell
                            defaultValue={it.label}
                            onChange={(v) => touchLabel(cat.catId, sec.group, it.key, v)}
                          />
                          <button
                            type="button"
                            className="pe-delete-btn"
                            title={`Remover ${it.label}`}
                            onClick={() => onDeleteEntry(cat.catId, sec.group, it.key, it.label)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
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
