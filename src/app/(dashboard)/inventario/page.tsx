'use client';

import { useState, useEffect } from 'react';
import { Alert, Paginacion, SpinnerPagina, Input } from '@/components/ui';
import { TablaProductosStock, ModalKardex, ModalAjuste } from '@/components/inventario';
import { useInventario } from '@/hooks/useInventario';
import { useAuth } from '@/hooks/useAuth';

export default function InventarioPage() {
  const { usuario } = useAuth();
  const {
    productos,
    kardex,
    productoSeleccionado,
    cargando,
    cargandoKardex,
    error,
    paginaActual,
    totalPaginas,
    cargarProductos,
    buscar,
    cambiarPagina,
    seleccionarProducto,
    cargarKardex,
    crearMovimiento,
    limpiarError,
  } = useInventario();

  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false);

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Debounce para búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      buscar(busquedaTexto);
    }, 300);
    return () => clearTimeout(timeout);
  }, [busquedaTexto, buscar]);

  const handleAjuste = async (datos: Parameters<typeof crearMovimiento>[1]) => {
    if (!productoSeleccionado) return { exito: false, error: 'No hay producto seleccionado' };
    return crearMovimiento(productoSeleccionado.id, datos);
  };

  if (cargando && productos.length === 0) {
    return <SpinnerPagina mensaje="Cargando inventario..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
        <p className="text-foreground-muted mt-1">
          Stock y movimientos de productos
        </p>
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

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Buscar por nombre o código..."
          value={busquedaTexto}
          onChange={(e) => setBusquedaTexto(e.target.value)}
          iconoIzquierda={
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          className="max-w-sm"
        />
      </div>

      <div className="bg-background border border-border rounded-[var(--radius)] p-4">
        <TablaProductosStock
          productos={productos}
          onSeleccionar={seleccionarProducto}
        />
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiarPagina={cambiarPagina}
      />

      <ModalKardex
        producto={productoSeleccionado}
        kardex={kardex}
        cargando={cargandoKardex}
        onCerrar={() => seleccionarProducto(null)}
        onCargar={cargarKardex}
        onAjuste={() => setModalAjusteAbierto(true)}
        esAdmin={esAdmin}
      />

      {productoSeleccionado && (
        <ModalAjuste
          abierto={modalAjusteAbierto}
          productoNombre={productoSeleccionado.nombre}
          stockActual={kardex?.stock ?? productoSeleccionado.stock}
          onCerrar={() => setModalAjusteAbierto(false)}
          onGuardar={handleAjuste}
        />
      )}
    </div>
  );
}
