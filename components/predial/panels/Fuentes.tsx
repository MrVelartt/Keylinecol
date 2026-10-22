'use client'

import { Accent } from '@/components/ui/SectionHeader'
import { ADVERTENCIA_APU, FUENTES, SUPUESTOS } from '@/data/catalogos/predial'
import { Card, Note, PanelHeader, Table, type PanelProps } from '../ui'

export default function Fuentes(_: PanelProps) {
  return (
    <>
      <PanelHeader
        eyebrow="Trazabilidad · 10"
        title={
          <>
            Fuentes y <Accent>supuestos</Accent>
          </>
        }
      >
        De dónde sale cada número y qué tan firme es. Los valores de referencia deben cotizarse localmente antes de comprometer
        un presupuesto.
      </PanelHeader>

      <div className="space-y-5">
        <Card title="Supuestos de cálculo">
          <Table minWidth={560}>
            <thead>
              <tr>
                <th className="w-56">Concepto</th>
                <th>Cómo se calcula</th>
              </tr>
            </thead>
            <tbody>
              {SUPUESTOS.map(([k, v]) => (
                <tr key={k}>
                  <td className="!py-3 text-primary font-medium align-top">{k}</td>
                  <td className="!py-3 text-secondary leading-relaxed">{v}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="rounded-2xl border border-subtle bg-surface-raised divide-y divide-subtle">
          {FUENTES.map((f) => (
            <details key={f.tema} className="group px-5 lg:px-6">
              <summary className="py-4 cursor-pointer list-none flex items-center justify-between gap-4 text-primary font-medium">
                {f.tema}
                <span aria-hidden="true" className="text-mono transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <ul className="pb-4 space-y-2">
                {f.refs.map(([texto, url]) => (
                  <li key={url} className="text-sm leading-relaxed">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-brand underline decoration-line-strong underline-offset-2">
                      {texto}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <Note tone="warn">
          <strong>Advertencia metodológica.</strong> {ADVERTENCIA_APU}
        </Note>
      </div>
    </>
  )
}
