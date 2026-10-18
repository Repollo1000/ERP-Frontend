'use client';

import { Badge } from '@/components/ui';
import type { MovimientoInventario, TipoMovimiento } from '@/types';

const ETIQUETAS_TIPO: Record<TipoMovimiento, { texto: string; variante: 'success' | 'danger' | 'info' | 'warning' }> = {
  INVENTARIO_INICIAL: { texto: 'Inventario inicial', variante: 'info' },
  AJUSTE_ENTRADA: { texto: 'Ajuste entrada', variante: 'success' },
  AJUSTE_SALIDA: { texto: 'Ajuste salida', variante: 'warning' },
  VENTA: { texto: 'Venta', variante: 'danger' },
  ANULACION_VENTA: { texto: 'Anulación venta', variante: 'success' },
  COMPRA: { texto: 'Compra', variante: 'success' },
  ANULACION_COMPRA: { texto: 'Anulación compra', variante: 'danger' },
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TablaKardexProps {
  movimientos: MovimientoInventario[];
  stock: number;
}

export function TablaKardex({ movimientos, stock }: TablaKardexProps) {
  if (movimientos.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-muted">
        <p>No hay movimientos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-background-subtle rounded-[var(--radius)]">
        <span className="text-foreground-muted">Stock actual</span>
        <span className="text-2xl font-bold tabular-nums">{stock}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-foreground-muted">N°</th>
              <th className="pb-2 font-medium text-foreground-muted">Fecha</th>
              <th className="pb-2 font-medium text-foreground-muted">Tipo</th>
              <th className="pb-2 font-medium text-foreground-muted text-right">Cantidad</th>
              <th className="pb-2 font-medium text-foreground-muted text-right">Saldo</th>
              <th className="pb-2 font-medium text-foreground-muted">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => {
              const tipoInfo = ETIQUETAS_TIPO[mov.tipo];
              const esEntrada = mov.cantidad > 0;

              return (
                <tr key={mov.id} className="border-b border-border">
                  <td className="py-2 text-foreground-muted">{mov.numero}</td>
                  <td className="py-2 text-foreground-muted">{formatearFecha(mov.fecha)}</td>
                  <td className="py-2">
                    <Badge variante={tipoInfo.variante}>{tipoInfo.texto}</Badge>
                  </td>
                  <td className={`py-2 text-right tabular-nums font-medium ${esEntrada ? 'text-success' : 'text-danger'}`}>
                    {esEntrada ? '+' : ''}{mov.cantidad}
                  </td>
                  <td className="py-2 text-right tabular-nums">{mov.saldo}</td>
                  <td className="py-2 text-foreground-muted">{mov.motivo || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaKardex;
