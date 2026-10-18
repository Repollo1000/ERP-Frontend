'use client';

import { useState } from 'react';
import { Modal, Button, Input, Badge } from '@/components/ui';
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

interface ModalDetalleCompraProps {
  compra: Compra | null;
  onCerrar: () => void;
  onAnular: (id: string, motivo: string) => Promise<{ exito: boolean; error?: string }>;
  esAdmin?: boolean;
}

export function ModalDetalleCompra({
  compra,
  onCerrar,
  onAnular,
  esAdmin = false,
}: ModalDetalleCompraProps) {
  const [mostrarAnular, setMostrarAnular] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [anulando, setAnulando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!compra) return null;

  const handleAnular = async () => {
    if (!motivo.trim()) {
      setError('El motivo es requerido');
      return;
    }

    setAnulando(true);
    setError(null);

    const resultado = await onAnular(compra.id, motivo.trim());

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
    <Modal abierto={!!compra} onCerrar={handleCerrar} titulo={`Compra #${compra.numero}`} className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-muted">Folio</p>
              <p className="font-medium">{compra.folio}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Fecha documento</p>
              <p>{formatearFecha(compra.fechaDocumento)}</p>
            </div>
          </div>
          <Badge variante={compra.anulada ? 'danger' : 'success'}>
            {compra.anulada ? 'Anulada' : 'Vigente'}
          </Badge>
        </div>

        {compra.proveedorNombre && (
          <div>
            <p className="text-sm text-foreground-muted">Proveedor</p>
            <p>{compra.proveedorNombre}</p>
          </div>
        )}

        {compra.anulada && compra.motivoAnulacion && (
          <div className="bg-danger-light border border-danger rounded-[var(--radius)] p-3">
            <p className="text-sm text-danger-700 font-medium">Motivo de anulación</p>
            <p className="text-sm text-danger-700">{compra.motivoAnulacion}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-foreground-muted mb-2">Detalle</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium">Producto</th>
                <th className="pb-2 text-right font-medium">Cant.</th>
                <th className="pb-2 text-right font-medium">Costo</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {compra.lineas.map((linea, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-2">{linea.productoNombre}</td>
                  <td className="py-2 text-right tabular-nums">{linea.cantidad}</td>
                  <td className="py-2 text-right tabular-nums">{formatearPrecio(linea.costoUnitario)}</td>
                  <td className="py-2 text-right tabular-nums">{formatearPrecio(linea.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Neto</span>
            <span className="tabular-nums">{formatearPrecio(compra.neto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (19%)</span>
            <span className="tabular-nums">{formatearPrecio(compra.iva)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatearPrecio(compra.total)}</span>
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
          {esAdmin && !compra.anulada && !mostrarAnular && (
            <Button variante="danger" onClick={() => setMostrarAnular(true)}>
              Anular compra
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

export default ModalDetalleCompra;
