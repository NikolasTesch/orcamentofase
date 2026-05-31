"use client"

import { useEffect, useState } from 'react'
import PageLayout from '../../components/app/PageLayout'
import PageHeader from '../../components/app/PageHeader'
import { DEFAULT_SETTINGS, type AppSettings } from '../../lib/settings'

const FIELDS: { key: keyof AppSettings; label: string; placeholder: string }[] = [
  { key: 'companyName', label: 'Nome da empresa', placeholder: 'FASE ESPORTE' },
  { key: 'tagline', label: 'Subtítulo / ramo de atividade', placeholder: 'Uniformes e Equipamentos Esportivos' },
  { key: 'city', label: 'Cidade e estado', placeholder: 'Teixeira de Freitas — BA' },
  { key: 'phone', label: 'Telefone principal (exibido no PDF)', placeholder: '(73) 99123-4567' },
  { key: 'phone2', label: 'Telefone secundário / fixo', placeholder: '73.3263.9900' },
  { key: 'email', label: 'E-mail comercial', placeholder: 'contato@faseesporte.com.br' },
  { key: 'website', label: 'Site', placeholder: 'www.faseesporte.com.br' },
  { key: 'social', label: 'Redes sociais (Instagram / @)', placeholder: '@fase.sport' },
]

export default function ConfigPage() {
  const [form, setForm] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, text: '', ok: true })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data) setForm({ ...DEFAULT_SETTINGS, ...r.data })
      })
      .finally(() => setLoading(false))
  }, [])

  const flashToast = (text: string, ok = true) => {
    setToast({ show: true, text, ok })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200)
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: form }),
      })
      const r = await res.json()
      if (r.success) {
        flashToast('Configurações salvas com sucesso')
      } else {
        flashToast('Erro ao salvar: ' + (r.error || 'Erro desconhecido'), false)
      }
    } catch {
      flashToast('Erro de conexão ao salvar', false)
    } finally {
      setSaving(false)
    }
  }

  const onReset = () => {
    if (!window.confirm('Restaurar todas as configurações para os valores padrão?')) return
    setForm(DEFAULT_SETTINGS)
    flashToast('Configurações restauradas — clique em Salvar para confirmar')
  }

  const patch = (key: keyof AppSettings, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Restaurar padrão
      </button>
      <button type="button" className="btn btn--primary" onClick={onSave} disabled={saving}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3h11l3 3v15H5V3Z" />
          <path d="M8 3v6h7M8 21v-7h8v7" />
        </svg>
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </>
  )

  return (
    <PageLayout maxWidth="standard">
      <div className="admin-body">
        <PageHeader
          title="Configurações da empresa"
          subtitle="Dados institucionais exibidos nos orçamentos em PDF. Altere aqui para que todos os documentos gerados reflitam as informações atualizadas."
          eyebrow="Administração · Empresa"
          actions={actions}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Carregando configurações…
          </div>
        ) : (
          <div className="panel glass-panel" style={{ maxWidth: 680 }}>
            <div className="pe-section__title" style={{ marginBottom: 4 }}>Dados da empresa</div>
            <div className="pe-section__sub" style={{ marginBottom: 24 }}>
              Estes campos aparecem no cabeçalho e rodapé do orçamento A4 impresso.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="pe-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {label}
                  </label>
                  <input
                    className="pe-input"
                    type="text"
                    value={form[key]}
                    placeholder={placeholder}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius)',
                    }}
                    onChange={(e) => patch(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview card */}
        {!loading && (
          <div className="panel" style={{ maxWidth: 680, marginTop: 0 }}>
            <div className="pe-section__title" style={{ marginBottom: 4 }}>Prévia no PDF</div>
            <div className="pe-section__sub" style={{ marginBottom: 16 }}>Como ficará o cabeçalho do orçamento impresso.</div>
            <div
              style={{
                background: '#AF0608',
                color: '#fff',
                borderRadius: 6,
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>
                <b>{form.companyName}</b> · {form.tagline}
              </span>
              <span>{form.city} · {form.phone} · {form.email}</span>
            </div>
            <div
              style={{
                background: '#AF0608',
                color: '#fff',
                borderRadius: 6,
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
            >
              <span>{form.website} · {form.phone2}</span>
              <span>Siga nossas redes sociais: {form.social}</span>
            </div>
          </div>
        )}
      </div>

      <div
        className={`saved-toast${toast.show ? ' show' : ''}`}
        style={!toast.ok ? { background: 'var(--color-danger)' } : undefined}
      >
        {toast.text}
      </div>
    </PageLayout>
  )
}
