'use client';

import { Badge } from '@/components/ui';
import type { VentaResumen } from '@/types';

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

function formatearFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatearHora(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TablaVentasProps {
  ventas: VentaResumen[];
  onSeleccionar: (venta: VentaResumen) => void;
}

export function TablaVentas({ ventas, onSeleccionar }: TablaVentasProps) {
  if (ventas.length === 0) {
    return (
      <div className="text-center py-12 text-foreground-muted">
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
        </svg>
        <p className="text-lg font-medium">No hay ventas registradas</p>
        <p className="text-sm mt-1">Las ventas que realices aparecerán aquí</p>
      </div>
    );
  }

  // Calcular totales del listado actual (solo ventas vigentes)
  const ventasVigentes = ventas.filter(v => v.estado === 'VIGENTE');
  const ventasAnuladas = ventas.filter(v => v.estado === 'ANULADA');
  const totalVentas = ventasVigentes.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="space-y-4">
      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-background-subtle rounded-[var(--radius)]">
        <div>
          <p className="text-sm text-foreground-muted">Total ventas</p>
          <p className="text-xl font-bold tabular-nums">{formatearPrecio(totalVentas)}</p>
        </div>
        <div>
          <p className="text-sm text-foreground-muted">Vigentes</p>
          <p className="text-xl font-bold tabular-nums text-success">{ventasVigentes.length}</p>
        </div>
        <div>
          <p className="text-sm text-foreground-muted">Anuladas</p>
          <p className="text-xl font-bold tabular-nums text-danger">{ventasAnuladas.length}</p>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-foreground-muted">N° Venta</th>
              <th className="pb-3 font-medium text-foreground-muted">Fecha</th>
              <th className="pb-3 font-medium text-foreground-muted text-right">Total</th>
              <th className="pb-3 font-medium text-foreground-muted text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => {
              const esAnulada = venta.estado === 'ANULADA';
              return (
                <tr
                  key={venta.id}
                  className={`
                    border-b border-border cursor-pointer transition-colors
                    ${esAnulada
                      ? 'bg-danger-light/30 hover:bg-danger-light/50 opacity-75'
                      : 'hover:bg-background-subtle'
                    }
                  `}
                  onClick={() => onSeleccionar(venta)}
                >
                  <td className="py-3">
                    <span className="font-mono font-medium">#{venta.numero.toString().padStart(4, '0')}</span>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{formatearFecha(venta.emitidaEn)}</p>
                      <p className="text-sm text-foreground-muted">{formatearHora(venta.emitidaEn)}</p>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums font-bold">
                    {formatearPrecio(venta.total)}
                  </td>
                  <td className="py-3 text-center">
                    <Badge variante={esAnulada ? 'danger' : 'success'}>
                      {esAnulada ? 'Anulada' : 'Vigente'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-background-subtle font-medium">
            <tr>
              <td colSpan={2} className="py-3 px-2 text-right">
                Total (vigentes):
              </td>
              <td className="py-3 text-right tabular-nums font-bold">
                {formatearPrecio(totalVentas)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-sm text-foreground-muted text-center">
        Haz clic en una venta para ver el desglose de IVA y productos
      </p>
    </div>
  );
}

export default TablaVentas;
