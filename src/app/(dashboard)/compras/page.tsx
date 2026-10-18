'use client';

import { useState } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina } from '@/components/ui';
import { TablaCompras, ModalNuevaCompra, ModalDetalleCompra } from '@/components/compras';
import { useCompras } from '@/hooks/useCompras';
import { useAuth } from '@/hooks/useAuth';

export default function ComprasPage() {
  const { usuario } = useAuth();
  const {
    compras,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    compraSeleccionada,
    cambiarPagina,
    crearCompra,
    anularCompra,
    seleccionarCompra,
    limpiarError,
  } = useCompras();

  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  const handleCrearCompra = async (datos: Parameters<typeof crearCompra>[0]) => {
    setGuardando(true);
    try {
      return await crearCompra(datos);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando && compras.length === 0) {
    return <SpinnerPagina mensaje="Cargando compras..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compras</h1>
          <p className="text-foreground-muted mt-1">
            Registro de compras
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
          Nueva compra
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
        <TablaCompras
          compras={compras}
          onSeleccionar={seleccionarCompra}
        />
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiarPagina={cambiarPagina}
      />

      <ModalNuevaCompra
        abierto={modalNuevaAbierto}
        onCerrar={() => setModalNuevaAbierto(false)}
        onGuardar={handleCrearCompra}
        guardando={guardando}
      />

      <ModalDetalleCompra
        compra={compraSeleccionada}
        onCerrar={() => seleccionarCompra(null)}
        onAnular={anularCompra}
        esAdmin={esAdmin}
      />
    </div>
  );
}
