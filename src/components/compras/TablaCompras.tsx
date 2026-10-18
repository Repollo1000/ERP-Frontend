'use client';

import { Badge } from '@/components/ui';
import type { Compra } from '@/types';

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
  });
}

interface TablaComprasProps {
  compras: Compra[];
  onSeleccionar: (compra: Compra) => void;
}

export function TablaCompras({ compras, onSeleccionar }: TablaComprasProps) {
  if (compras.length === 0) {
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p>No hay compras</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-medium text-foreground-muted">N°</th>
            <th className="pb-3 font-medium text-foreground-muted">Folio</th>
            <th className="pb-3 font-medium text-foreground-muted">Fecha Doc.</th>
            <th className="pb-3 font-medium text-foreground-muted">Proveedor</th>
            <th className="pb-3 font-medium text-foreground-muted text-right">Total</th>
            <th className="pb-3 font-medium text-foreground-muted">Estado</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr
              key={compra.id}
              className="border-b border-border hover:bg-background-subtle cursor-pointer transition-colors"
              onClick={() => onSeleccionar(compra)}
            >
              <td className="py-3 font-medium">{compra.numero}</td>
              <td className="py-3">{compra.folio}</td>
              <td className="py-3 text-foreground-muted">{formatearFecha(compra.fechaDocumento)}</td>
              <td className="py-3">{compra.proveedorNombre || 'Sin proveedor'}</td>
              <td className="py-3 text-right tabular-nums font-medium">
                {formatearPrecio(compra.total)}
              </td>
              <td className="py-3">
                <Badge variante={compra.anulada ? 'danger' : 'success'}>
                  {compra.anulada ? 'Anulada' : 'Vigente'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaCompras;
