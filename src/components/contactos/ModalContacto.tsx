'use client';

import { Modal } from '@/components/ui';
import { FormularioContacto } from './FormularioContacto';
import type { Contacto, DatosContacto } from '@/types';

interface ModalContactoProps {
  abierto: boolean;
  contacto?: Contacto | null;
  onCerrar: () => void;
  onGuardar: (datos: DatosContacto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  guardando?: boolean;
}

export function ModalContacto({
  abierto,
  contacto,
  onCerrar,
  onGuardar,
  guardando = false,
}: ModalContactoProps) {
  const titulo = contacto ? 'Editar contacto' : 'Nuevo contacto';

  const handleGuardar = async (datos: DatosContacto) => {
    const resultado = await onGuardar(datos);
    if (resultado.exito) {
      onCerrar();
    }
    return resultado;
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <FormularioContacto
        contacto={contacto}
        onGuardar={handleGuardar}
        onCancelar={onCerrar}
        guardando={guardando}
      />
    </Modal>
  );
}

export default ModalContacto;
