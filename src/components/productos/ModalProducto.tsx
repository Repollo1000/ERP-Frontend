'use client';

import { Modal } from '@/components/ui';
import { FormularioProducto } from './FormularioProducto';
import type { Producto, DatosProducto } from '@/types';

interface ModalProductoProps {
  abierto: boolean;
  producto?: Producto | null;
  onCerrar: () => void;
  onGuardar: (datos: DatosProducto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  guardando?: boolean;
}

export function ModalProducto({
  abierto,
  producto,
  onCerrar,
  onGuardar,
  guardando = false,
}: ModalProductoProps) {
  const titulo = producto ? 'Editar producto' : 'Nuevo producto';

  const handleGuardar = async (datos: DatosProducto) => {
    const resultado = await onGuardar(datos);
    if (resultado.exito) {
      onCerrar();
    }
    return resultado;
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <FormularioProducto
        producto={producto}
        onGuardar={handleGuardar}
        onCancelar={onCerrar}
        guardando={guardando}
      />
    </Modal>
  );
}

export default ModalProducto;
