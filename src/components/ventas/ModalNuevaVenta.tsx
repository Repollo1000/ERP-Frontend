'use client';

import { Modal } from '@/components/ui';
import { FormularioVenta } from './FormularioVenta';
import type { SolicitudVenta } from '@/types';

interface ModalNuevaVentaProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (datos: SolicitudVenta) => Promise<{ exito: boolean; error?: string }>;
  guardando?: boolean;
}

export function ModalNuevaVenta({
  abierto,
  onCerrar,
  onGuardar,
  guardando = false,
}: ModalNuevaVentaProps) {
  const handleGuardar = async (datos: SolicitudVenta) => {
    const resultado = await onGuardar(datos);
    if (resultado.exito) {
      onCerrar();
    }
    return resultado;
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Nueva venta" className="max-w-2xl">
      <FormularioVenta
        onGuardar={handleGuardar}
        onCancelar={onCerrar}
        guardando={guardando}
      />
    </Modal>
  );
}

export default ModalNuevaVenta;
