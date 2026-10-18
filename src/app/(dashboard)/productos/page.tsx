'use client';

import { useState } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina } from '@/components/ui';
import {
  TablaProductos,
  BusquedaProductos,
  ModalProducto,
} from '@/components/productos';
import { useProductos } from '@/hooks/useProductos';
import { useAuth } from '@/hooks/useAuth';
import type { DatosProducto } from '@/types';

export default function ProductosPage() {
  const { usuario } = useAuth();
  const {
    productos,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    productoEditando,
    buscar,
    cambiarPagina,
    crearProducto,
    actualizarProducto,
    desactivarProducto,
    seleccionarParaEditar,
    limpiarError,
  } = useProductos();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [errorDesactivar, setErrorDesactivar] = useState<string | null>(null);

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  const abrirModalNuevo = () => {
    seleccionarParaEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto: Parameters<typeof seleccionarParaEditar>[0]) => {
    seleccionarParaEditar(producto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    seleccionarParaEditar(null);
  };

  const handleGuardar = async (datos: DatosProducto) => {
    setGuardando(true);
    try {
      if (productoEditando) {
        return await actualizarProducto(productoEditando.id, datos);
      } else {
        return await crearProducto(datos);
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (id: string) => {
    setDesactivando(true);
    setErrorDesactivar(null);
    try {
      const resultado = await desactivarProducto(id);
      if (!resultado.exito) {
        setErrorDesactivar(resultado.error || 'Error al desactivar');
      }
    } finally {
      setDesactivando(false);
    }
  };

  if (cargando && productos.length === 0) {
    return <SpinnerPagina mensaje="Cargando productos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-foreground-muted mt-1">
            Gestiona el catálogo de productos
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
          Nuevo producto
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
        <BusquedaProductos onBuscar={buscar} />
      </div>

      <div className="bg-background border border-border rounded-[var(--radius)] p-4">
        <TablaProductos
          productos={productos}
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

      <ModalProducto
        abierto={modalAbierto}
        producto={productoEditando}
        onCerrar={cerrarModal}
        onGuardar={handleGuardar}
        guardando={guardando}
      />
    </div>
  );
}
