'use client';

import { useState } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina } from '@/components/ui';
import { TablaVentas, ModalNuevaVenta, ModalDetalleVenta } from '@/components/ventas';
import { useVentas } from '@/hooks/useVentas';
import { useAuth } from '@/hooks/useAuth';

export default function VentasPage() {
  const { usuario } = useAuth();
  const {
    ventas,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    ventaSeleccionada,
    cambiarPagina,
    crearVenta,
    anularVenta,
    seleccionarVenta,
    limpiarError,
  } = useVentas();

  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  const handleCrearVenta = async (datos: Parameters<typeof crearVenta>[0]) => {
    setGuardando(true);
    try {
      return await crearVenta(datos);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando && ventas.length === 0) {
    return <SpinnerPagina mensaje="Cargando ventas..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
          <p className="text-foreground-muted mt-1">
            Registro de ventas
          </p>
        </div>
        <Button onClick={() => setModalNuevaAbierto(true)}>
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
          Nueva venta
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

      <div className="bg-background border border-border rounded-[var(--radius)] p-4">
        <TablaVentas
          ventas={ventas}
          onSeleccionar={seleccionarVenta}
        />
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiarPagina={cambiarPagina}
      />

      <ModalNuevaVenta
        abierto={modalNuevaAbierto}
        onCerrar={() => setModalNuevaAbierto(false)}
        onGuardar={handleCrearVenta}
        guardando={guardando}
      />

      <ModalDetalleVenta
        venta={ventaSeleccionada}
        onCerrar={() => seleccionarVenta(null)}
        onAnular={anularVenta}
        esAdmin={esAdmin}
      />
    </div>
  );
}
