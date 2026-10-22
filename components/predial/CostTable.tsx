'use client'

import { subtotalDiseno, subtotalObra, type CapaCostoId } from '@/lib/calculos/predial'
import { nuevoId } from '@/data/catalogos/predial'
import { cop } from './fmt'
import { AddButton, DelButton, Num, NumCell, Pill, Table, TextCell, type PanelProps } from './ui'

/**
 * Tabla de ítems de obra de una capa: descripción, cantidad, unidad y precio
 * unitario editables (opción A · pública completa). Los ítems marcados como
 * diseño se calculan pero quedan fuera del total cotizado.
 */
export default function CostTable({ capa, s, set }: Pick<PanelProps, 's' | 'set'> & { capa: CapaCostoId }) {
  const filas = s.costos[capa]
  const obra = subtotalObra(filas)
  const diseno = subtotalDiseno(filas)
  const edit = (i: number, f: (row: (typeof filas)[number]) => void) => set((d) => f(d.costos[capa][i]))

  return (
    <>
      <Table minWidth={760}>
        <thead>
          <tr>
            <th>Descripción</th>
            <th className="!text-right w-24">Cantidad</th>
            <th className="w-24">Unidad</th>
            <th className="!text-right w-32">Valor unitario</th>
            <th className="!text-right w-36">Subtotal</th>
            <th className="!text-center w-16" title="Honorario de diseño: se excluye de la cotización">
              Diseño
            </th>
            <th className="w-9" />
          </tr>
        </thead>
        <tbody>
          {filas.map((row, i) => (
            <tr key={row.id}>
              <td>
                <TextCell label="Descripción" value={row.nombre} onChange={(v) => edit(i, (r) => (r.nombre = v))} />
              </td>
              <td>
                <NumCell label="Cantidad" value={row.cantidad} onChange={(v) => edit(i, (r) => (r.cantidad = v))} />
              </td>
              <td>
                <TextCell label="Unidad" value={row.unidad} onChange={(v) => edit(i, (r) => (r.unidad = v))} />
              </td>
              <td>
                <NumCell label="Valor unitario" step={1000} value={row.precio} onChange={(v) => edit(i, (r) => (r.precio = v))} />
              </td>
              <Num muted={row.diseno}>{row.diseno ? <Pill tone="warn">diseño</Pill> : cop(row.cantidad * row.precio)}</Num>
              <td className="text-center">
                <input
                  type="checkbox"
                  aria-label="Honorario de diseño"
                  checked={row.diseno}
                  onChange={(e) => edit(i, (r) => (r.diseno = e.target.checked))}
                  className="w-4 h-4 accent-brand cursor-pointer"
                />
              </td>
              <td>
                <DelButton label="Eliminar ítem" onClick={() => set((d) => void d.costos[capa].splice(i, 1))} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total de obra de la capa</td>
            <Num>{cop(obra)}</Num>
            <td colSpan={2} />
          </tr>
          {diseno > 0 && (
            <tr>
              <td colSpan={4} className="!font-normal !text-mono">
                Honorarios de diseño (fuera de la cotización)
              </td>
              <Num muted>{cop(diseno)}</Num>
              <td colSpan={2} />
            </tr>
          )}
        </tfoot>
      </Table>
      <AddButton
        onClick={() =>
          set((d) =>
            void d.costos[capa].push({ id: nuevoId('c'), nombre: 'Nuevo ítem', cantidad: 1, unidad: 'und', precio: 0, diseno: false })
          )
        }
      >
        Agregar ítem
      </AddButton>
    </>
  )
}
