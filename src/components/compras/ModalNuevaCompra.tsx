'use client';

import { Modal } from '@/components/ui';
import { FormularioCompra } from './FormularioCompra';
import type { SolicitudCompra } from '@/types';

interface ModalNuevaCompraProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (datos: SolicitudCompra) => Promise<{ exito: boolean; error?: string }>;
  guardando?: boolean;
}

export function ModalNuevaCompra({
  abierto,
  onCerrar,
  onGuardar,
  guardando = false,
}: ModalNuevaCompraProps) {
  const handleGuardar = async (datos: SolicitudCompra) => {
    const resultado = await onGuardar(datos);
    if (resultado.exito) {
      onCerrar();
    }
    return resultado;
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Nueva compra" className="max-w-2xl">
      <FormularioCompra
        onGuardar={handleGuardar}
        onCancelar={onCerrar}
        guardando={guardando}
      />
    </Modal>
  );
}

export default ModalNuevaCompra;
