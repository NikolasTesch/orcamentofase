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
              onChange={(e) => setClient({ phone: e.target.value })}
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
