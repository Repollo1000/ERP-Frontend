'use client';

import { useState } from 'react';
import { Modal, Button, Input, Badge } from '@/components/ui';
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

interface ModalDetalleVentaProps {
  venta: Venta | null;
  onCerrar: () => void;
  onAnular: (id: string, motivo: string) => Promise<{ exito: boolean; error?: string }>;
  esAdmin?: boolean;
}

export function ModalDetalleVenta({
  venta,
  onCerrar,
  onAnular,
  esAdmin = false,
}: ModalDetalleVentaProps) {
  const [mostrarAnular, setMostrarAnular] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [anulando, setAnulando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!venta) return null;

  const handleAnular = async () => {
    if (!motivo.trim()) {
      setError('El motivo es requerido');
      return;
    }

    setAnulando(true);
    setError(null);

    const resultado = await onAnular(venta.id, motivo.trim());

    if (resultado.exito) {
      setMostrarAnular(false);
      setMotivo('');
      onCerrar();
    } else {
      setError(resultado.error || 'Error al anular');
    }

    setAnulando(false);
  };

  const handleCerrar = () => {
    setMostrarAnular(false);
    setMotivo('');
    setError(null);
    onCerrar();
  };

  return (
    <Modal abierto={!!venta} onCerrar={handleCerrar} titulo={`Venta #${venta.numero}`} className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-foreground-muted">Fecha</p>
            <p>{formatearFecha(venta.fecha)}</p>
          </div>
          <Badge variante={venta.anulada ? 'danger' : 'success'}>
            {venta.anulada ? 'Anulada' : 'Vigente'}
          </Badge>
        </div>

        {venta.clienteNombre && (
          <div>
            <p className="text-sm text-foreground-muted">Cliente</p>
            <p>{venta.clienteNombre}</p>
          </div>
        )}

        {venta.anulada && venta.motivoAnulacion && (
          <div className="bg-danger-light border border-danger rounded-[var(--radius)] p-3">
            <p className="text-sm text-danger-700 font-medium">Motivo de anulación</p>
            <p className="text-sm text-danger-700">{venta.motivoAnulacion}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-foreground-muted mb-2">Detalle</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium">Producto</th>
                <th className="pb-2 text-right font-medium">Cant.</th>
                <th className="pb-2 text-right font-medium">Precio</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {venta.lineas.map((linea, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-2">{linea.productoNombre}</td>
                  <td className="py-2 text-right tabular-nums">{linea.cantidad}</td>
                  <td className="py-2 text-right tabular-nums">{formatearPrecio(linea.precioUnitario)}</td>
                  <td className="py-2 text-right tabular-nums">{formatearPrecio(linea.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Neto</span>
            <span className="tabular-nums">{formatearPrecio(venta.neto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (19%)</span>
            <span className="tabular-nums">{formatearPrecio(venta.iva)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatearPrecio(venta.total)}</span>
          </div>
        </div>

        {mostrarAnular && (
          <div className="border-t border-border pt-4 space-y-3">
            <Input
              etiqueta="Motivo de anulación"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              error={error || undefined}
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                variante="secondary"
                tamaño="sm"
                onClick={() => {
                  setMostrarAnular(false);
                  setMotivo('');
                  setError(null);
                }}
                disabled={anulando}
              >
                Cancelar
              </Button>
              <Button
                variante="danger"
                tamaño="sm"
                onClick={handleAnular}
                cargando={anulando}
              >
                Confirmar anulación
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          {esAdmin && !venta.anulada && !mostrarAnular && (
            <Button variante="danger" onClick={() => setMostrarAnular(true)}>
              Anular venta
            </Button>
          )}
          <Button variante="secondary" onClick={handleCerrar}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalDetalleVenta;
