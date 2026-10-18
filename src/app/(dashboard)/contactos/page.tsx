'use client';

import { useState } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina } from '@/components/ui';
import {
  TablaContactos,
  BusquedaContactos,
  FiltroTipoContacto,
  ModalContacto,
} from '@/components/contactos';
import { useContactos } from '@/hooks/useContactos';
import { useAuth } from '@/hooks/useAuth';
import type { DatosContacto } from '@/types';

export default function ContactosPage() {
  const { usuario } = useAuth();
  const {
    contactos,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    filtroTipo,
    contactoEditando,
    buscar,
    filtrarPorTipo,
    cambiarPagina,
    crearContacto,
    actualizarContacto,
    desactivarContacto,
    seleccionarParaEditar,
    limpiarError,
  } = useContactos();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [errorDesactivar, setErrorDesactivar] = useState<string | null>(null);

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  const abrirModalNuevo = () => {
    seleccionarParaEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (contacto: Parameters<typeof seleccionarParaEditar>[0]) => {
    seleccionarParaEditar(contacto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    seleccionarParaEditar(null);
  };

  const handleGuardar = async (datos: DatosContacto) => {
    setGuardando(true);
    try {
      if (contactoEditando) {
        return await actualizarContacto(contactoEditando.id, datos);
      } else {
        return await crearContacto(datos);
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (id: string) => {
    setDesactivando(true);
    setErrorDesactivar(null);
    try {
      const resultado = await desactivarContacto(id);
      if (!resultado.exito) {
        setErrorDesactivar(resultado.error || 'Error al desactivar');
      }
    } finally {
      setDesactivando(false);
    }
  };

  if (cargando && contactos.length === 0) {
    return <SpinnerPagina mensaje="Cargando contactos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-foreground-muted mt-1">
            Clientes y proveedores
          </p>
        </div>
        <Button onClick={abrirModalNuevo}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo contacto
        </Button>
      </div>

      {error && (
        <Alert tipo="danger" titulo="Error">
          {error}
          <button
            onClick={limpiarError}
            className="ml-2 underline hover:no-underline"
          >
            Cerrar
          </button>
        </Alert>
      )}

      {errorDesactivar && (
        <Alert tipo="danger" titulo="Error al desactivar">
          {errorDesactivar}
          <button
            onClick={() => setErrorDesactivar(null)}
            className="ml-2 underline hover:no-underline"
          >
            Cerrar
          </button>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <BusquedaContactos onBuscar={buscar} />
        <FiltroTipoContacto valor={filtroTipo} onChange={filtrarPorTipo} />
      </div>

      <div className="bg-background border border-border rounded-[var(--radius)] p-4">
        <TablaContactos
          contactos={contactos}
          onEditar={abrirModalEditar}
          onDesactivar={handleDesactivar}
          desactivando={desactivando}
          esAdmin={esAdmin}
        />
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiarPagina={cambiarPagina}
      />

      <ModalContacto
        abierto={modalAbierto}
        contacto={contactoEditando}
        onCerrar={cerrarModal}
        onGuardar={handleGuardar}
        guardando={guardando}
      />
    </div>
  );
}
