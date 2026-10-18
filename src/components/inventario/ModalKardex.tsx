'use client';

import { useEffect } from 'react';
import { Modal, Button, Spinner } from '@/components/ui';
import { TablaKardex } from './TablaKardex';
import type { Kardex, Producto } from '@/types';

interface ProductoConStock extends Producto {
  stock: number;
}

interface ModalKardexProps {
  producto: ProductoConStock | null;
  kardex: Kardex | null;
  cargando: boolean;
  onCerrar: () => void;
  onCargar: (productoId: string) => void;
  onAjuste: () => void;
  esAdmin?: boolean;
}

export function ModalKardex({
  producto,
  kardex,
  cargando,
  onCerrar,
  onCargar,
  onAjuste,
  esAdmin = false,
}: ModalKardexProps) {
  useEffect(() => {
    if (producto) {
      onCargar(producto.id);
    }
  }, [producto, onCargar]);

  if (!producto) return null;

  return (
    <Modal abierto={!!producto} onCerrar={onCerrar} titulo={`Kardex: ${producto.nombre}`} className="max-w-3xl">
      <div className="space-y-4">
        {cargando ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : kardex ? (
          <TablaKardex movimientos={kardex.movimientos} stock={kardex.stock} />
        ) : (
          <p className="text-foreground-muted text-center py-8">Error al cargar kardex</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          {esAdmin && producto.activo && (
            <Button onClick={onAjuste}>
              Nuevo ajuste
            </Button>
          )}
          <Button variante="secondary" onClick={onCerrar}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalKardex;
