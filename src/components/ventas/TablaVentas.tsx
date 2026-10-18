'use client';

import { Badge } from '@/components/ui';
import type { Venta } from '@/types';

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TablaVentasProps {
  ventas: Venta[];
  onSeleccionar: (venta: Venta) => void;
}

export function TablaVentas({ ventas, onSeleccionar }: TablaVentasProps) {
  if (ventas.length === 0) {
    return (
      <div className="text-center py-12 text-foreground-muted">
        <svg
          className="w-12 h-12 mx-auto mb-4 opacity-50"
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
        <p>No hay ventas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-medium text-foreground-muted">N°</th>
            <th className="pb-3 font-medium text-foreground-muted">Fecha</th>
            <th className="pb-3 font-medium text-foreground-muted">Cliente</th>
            <th className="pb-3 font-medium text-foreground-muted text-right">Total</th>
            <th className="pb-3 font-medium text-foreground-muted">Estado</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr
              key={venta.id}
              className="border-b border-border hover:bg-background-subtle cursor-pointer transition-colors"
              onClick={() => onSeleccionar(venta)}
            >
              <td className="py-3 font-medium">{venta.numero}</td>
              <td className="py-3 text-foreground-muted">{formatearFecha(venta.fecha)}</td>
              <td className="py-3">{venta.clienteNombre || 'Sin cliente'}</td>
              <td className="py-3 text-right tabular-nums font-medium">
                {formatearPrecio(venta.total)}
              </td>
              <td className="py-3">
                <Badge variante={venta.anulada ? 'danger' : 'success'}>
                  {venta.anulada ? 'Anulada' : 'Vigente'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaVentas;
