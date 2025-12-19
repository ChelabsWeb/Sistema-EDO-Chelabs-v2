'use client'

import { formatPesos } from '@/lib/utils/currency'
import type { RubroDeviationSummary } from '@/app/actions/costos'

interface RubroDeviationsProps {
  deviations: RubroDeviationSummary[]
}

const statusColors = {
  ok: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  alert: 'bg-red-100 text-red-800',
}

const statusLabels = {
  ok: 'OK',
  warning: 'Alerta',
  alert: 'Critico',
}

export function RubroDeviations({ deviations }: RubroDeviationsProps) {
  if (deviations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Desvios por Rubro</h2>
        <p className="text-gray-500 text-center py-4">No hay datos de desvios disponibles</p>
      </div>
    )
  }

  // Calculate totals
  const totals = deviations.reduce(
    (acc, d) => ({
      presupuesto: acc.presupuesto + d.presupuesto,
      estimado: acc.estimado + d.costo_estimado_total,
      real: acc.real + d.costo_real_total,
      desvio: acc.desvio + d.desvio,
    }),
    { presupuesto: 0, estimado: 0, real: 0, desvio: 0 }
  )

  const totalDesvioPorcentaje = totals.estimado > 0
    ? (totals.desvio / totals.estimado) * 100
    : 0

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Desvios por Rubro</h2>
        <p className="text-sm text-gray-500 mt-1">
          Comparacion de costos estimados vs reales por categoria
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rubro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presupuesto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Real
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desvio
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deviations.map((d) => (
              <tr key={d.rubro_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{d.rubro_nombre}</div>
                  <div className="text-xs text-gray-500">{d.ots_count} OTs</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatPesos(d.presupuesto)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatPesos(d.costo_estimado_total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {d.costo_real_total > 0 ? formatPesos(d.costo_real_total) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {d.costo_real_total > 0 ? (
                    <span className={d.desvio > 0 ? 'text-red-600 font-medium' : d.desvio < 0 ? 'text-green-600' : 'text-gray-900'}>
                      {d.desvio > 0 ? '+' : ''}{formatPesos(d.desvio)}
                      <span className="text-xs ml-1">
                        ({d.desvio_porcentaje > 0 ? '+' : ''}{d.desvio_porcentaje.toFixed(1)}%)
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {d.costo_real_total > 0 ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status]}`}>
                      {statusLabels[d.status]}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin datos</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                TOTAL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatPesos(totals.presupuesto)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatPesos(totals.estimado)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {totals.real > 0 ? formatPesos(totals.real) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {totals.real > 0 ? (
                  <span className={totals.desvio > 0 ? 'text-red-600 font-medium' : totals.desvio < 0 ? 'text-green-600' : 'text-gray-900'}>
                    {totals.desvio > 0 ? '+' : ''}{formatPesos(totals.desvio)}
                    <span className="text-xs ml-1">
                      ({totalDesvioPorcentaje > 0 ? '+' : ''}{totalDesvioPorcentaje.toFixed(1)}%)
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
