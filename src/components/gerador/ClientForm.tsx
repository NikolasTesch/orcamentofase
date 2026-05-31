"use client"

import { useBudget } from '../../context/budget-context'

export default function ClientForm() {
  const { client, setClient, partners } = useBudget()
  return (
    <div className="panel">
      <div className="panel__title">Dados do cliente</div>
      <div className="col">
        <div className="field">
          <label>Cliente</label>
          <input
            className="input"
            placeholder="Ex.: Academia Fitness"
            value={client.name}
            onChange={(e) => setClient({ name: e.target.value })}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>WhatsApp</label>
            <input
              className="input"
              placeholder="(73) 99999-9999"
              value={client.phone}
              inputMode="tel"
              maxLength={15}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
                let masked = raw
                if (raw.length > 10) {
                  masked = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`
                } else if (raw.length > 6) {
                  masked = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`
                } else if (raw.length > 2) {
                  masked = `(${raw.slice(0, 2)}) ${raw.slice(2)}`
                } else if (raw.length > 0) {
                  masked = `(${raw}`
                }
                setClient({ phone: masked })
              }}
            />
          </div>
          <div className="field">
            <label>Parceria</label>
            <select
              className="select"
              value={client.partnership}
              onChange={(e) => setClient({ partnership: e.target.value })}
            >
              {partners.map((p: string) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
