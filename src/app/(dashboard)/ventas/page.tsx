'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina, TablaToolbar, TablaAvanzada } from '@/components/ui';
import type { FiltroConfig, ColumnaConfig, VistaGuardada } from '@/components/ui';
import { ModalNuevaVenta, ModalDetalleVenta } from '@/components/ventas';
import { useVentas } from '@/hooks/useVentas';
import { useVistas } from '@/hooks/useVistas';
import { useAuth } from '@/hooks/useAuth';
import { exportarDatos } from '@/lib/exportar';
import type { VentaResumen, DireccionOrden } from '@/types';

// Función para formatear número de venta
const formatearNumero = (num: number) => num.toString().padStart(4, '0');

// Función para formatear fecha
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Columnas de la tabla
const COLUMNAS: ColumnaConfig<VentaResumen>[] = [
  {
    id: 'numero',
    titulo: 'N°',
    campo: 'numero',
    ordenable: true,
    ancho: '80px',
    render: (v) => formatearNumero(v.numero),
  },
  {
    id: 'fecha',
    titulo: 'Fecha',
    campo: 'emitidaEn',
    ordenable: true,
    ancho: '160px',
    render: (v) => formatearFecha(v.emitidaEn),
  },
  {
    id: 'total',
    titulo: 'Total',
    campo: 'total',
    ordenable: true,
    alineacion: 'right',
    ancho: '120px',
    render: (v) => `$${v.total.toLocaleString('es-CL')}`,
  },
  {
    id: 'estado',
    titulo: 'Estado',
    campo: 'estado',
    ordenable: true,
    ancho: '100px',
    render: (v) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        v.estado === 'VIGENTE'
          ? 'bg-success/10 text-success'
          : 'bg-danger/10 text-danger'
      }`}>
        {v.estado === 'VIGENTE' ? 'Vigente' : 'Anulada'}
      </span>
    ),
  },
];

export default function VentasPage() {
  const { usuario } = useAuth();
  const {
    ventas,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    totalElementos,
    filtros,
    ordenPor,
    ordenDir,
    ventaSeleccionada,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    crearVenta,
    anularVenta,
    seleccionarVenta,
    limpiarError,
  } = useVentas();

  const {
    vistas,
    vistaActual,
    crearVista,
    seleccionarVista,
    cargarVistas,
  } = useVistas();

  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Filtros locales del toolbar
  const [busquedaLocal, setBusquedaLocal] = useState('');

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  // Cargar vistas al montar
  useEffect(() => {
    cargarVistas('ventas');
  }, [cargarVistas]);

  // Función para obtener fechas de filtro
  const obtenerFechasFiltro = (periodo: string): { desde?: string; hasta?: string } => {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    if (periodo === 'hoy') {
      const inicioHoy = new Date();
      inicioHoy.setHours(0, 0, 0, 0);
      return { desde: inicioHoy.toISOString(), hasta: hoy.toISOString() };
    } else if (periodo === 'semana') {
      const inicioSemana = new Date();
      inicioSemana.setDate(hoy.getDate() - 7);
      inicioSemana.setHours(0, 0, 0, 0);
      return { desde: inicioSemana.toISOString(), hasta: hoy.toISOString() };
    } else if (periodo === 'mes') {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { desde: inicioMes.toISOString(), hasta: hoy.toISOString() };
    }
    return {};
  };

  // Configuración de filtros del toolbar
  const filtrosConfig: FiltroConfig[] = [
    {
      id: 'estado',
      etiqueta: 'Todos los estados',
      opciones: [
        { valor: 'emitida', etiqueta: 'Vigentes' },
        { valor: 'anulada', etiqueta: 'Anuladas' },
      ],
      valor: filtros.estado || '',
      onChange: (valor) => cambiarFiltros({ estado: valor as 'emitida' | 'anulada' | undefined }),
    },
    {
      id: 'fecha',
      etiqueta: 'Todas las fechas',
      opciones: [
        { valor: 'hoy', etiqueta: 'Hoy' },
        { valor: 'semana', etiqueta: 'Última semana' },
        { valor: 'mes', etiqueta: 'Este mes' },
      ],
      valor: filtros.desde ? 'personalizado' : '',
      onChange: (valor) => {
        const fechas = obtenerFechasFiltro(valor);
        cambiarFiltros({ desde: fechas.desde, hasta: fechas.hasta });
      },
    },
  ];

  // Vistas guardadas adaptadas
  const vistasTabla: VistaGuardada[] = vistas.map(v => ({
    id: v.id,
    nombre: v.nombre,
    columnas: v.configuracion.columnas,
    ordenPor: v.configuracion.orden?.campo,
    ordenDir: v.configuracion.orden?.dir,
    filtros: v.configuracion.filtros as Record<string, string>,
  }));

  // Handlers
  const handleBusqueda = useCallback((texto: string) => {
    setBusquedaLocal(texto);
    // Para ventas, la búsqueda sería por número - el backend debería soportarlo
  }, []);

  const handleOrden = useCallback((campo: string, dir: 'asc' | 'desc') => {
    cambiarOrden(campo, dir as DireccionOrden);
  }, [cambiarOrden]);

  const handleVistaChange = useCallback((vistaId: string | null) => {
    const vista = vistas.find(v => v.id === vistaId);
    seleccionarVista(vista || null);
    if (vista) {
      const config = vista.configuracion;
      if (config.filtros) {
        cambiarFiltros(config.filtros as Partial<typeof filtros>);
      }
      if (config.orden) {
        cambiarOrden(config.orden.campo, config.orden.dir);
      }
    }
  }, [vistas, seleccionarVista, cambiarFiltros, cambiarOrden]);

  const handleGuardarVista = useCallback(async (vista: Omit<VistaGuardada, 'id'>) => {
    await crearVista({
      modulo: 'ventas',
      nombre: vista.nombre,
      configuracion: {
        columnas: vista.columnas,
        filtros: filtros,
        orden: vista.ordenPor ? { campo: vista.ordenPor, dir: vista.ordenDir || 'asc' } : undefined,
      },
    });
  }, [crearVista, filtros]);

  const exportar = (formato: 'excel' | 'csv') => {
    const fecha = new Date().toISOString().split('T')[0];

    exportarDatos<VentaResumen>(
      ventas,
      [
        { titulo: 'N° Venta', campo: (v) => formatearNumero(v.numero), formato: 'texto' },
        { titulo: 'Fecha', campo: 'emitidaEn', formato: 'fecha' },
        { titulo: 'Total', campo: 'total', formato: 'moneda' },
        { titulo: 'Estado', campo: (v) => (v.estado === 'VIGENTE' ? 'Vigente' : 'Anulada'), formato: 'texto' },
      ],
      `ventas_${fecha}`,
      formato
    );
  };

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
            {totalElementos} venta{totalElementos !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Button onClick={() => setModalNuevaAbierto(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva venta
        </Button>
      </div>

      {error && (
        <Alert tipo="danger" titulo="Error">
          {error}
          <button onClick={limpiarError} className="ml-2 underline hover:no-underline">
            Cerrar
          </button>
        </Alert>
      )}

      {/* Toolbar */}
      <TablaToolbar
        busqueda={busquedaLocal}
        onBusquedaChange={handleBusqueda}
        placeholderBusqueda="Buscar por número de venta..."
        filtros={filtrosConfig}
        onExportarExcel={() => exportar('excel')}
        onExportarCSV={() => exportar('csv')}
        totalResultados={totalElementos}
      />

      <div className="bg-background border border-border rounded-[var(--radius)]">
        <TablaAvanzada
          datos={ventas}
          columnas={COLUMNAS}
          keyField="id"
          ordenPor={ordenPor}
          ordenDir={ordenDir}
          onOrdenChange={handleOrden}
          onFilaClick={seleccionarVenta}
          vistas={vistasTabla}
          vistaActual={vistaActual?.id}
          onVistaChange={handleVistaChange}
          onVistaGuardar={handleGuardarVista}
          storageKey="ventas"
          mensajeVacio="No hay ventas"
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
