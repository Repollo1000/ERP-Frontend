'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina, TablaToolbar, TablaAvanzada } from '@/components/ui';
import type { FiltroConfig, ColumnaConfig, AccionMasiva, VistaGuardada } from '@/components/ui';
import { ModalProducto } from '@/components/productos';
import { useProductos } from '@/hooks/useProductos';
import { useVistas } from '@/hooks/useVistas';
import { useAuth } from '@/hooks/useAuth';
import { exportarDatos } from '@/lib/exportar';
import type { DatosProducto, Producto, UnidadProducto, DireccionOrden } from '@/types';

const UNIDADES: { valor: UnidadProducto; etiqueta: string }[] = [
  { valor: 'UNIDAD', etiqueta: 'Unidad' },
  { valor: 'KILOGRAMO', etiqueta: 'Kilogramo' },
  { valor: 'GRAMO', etiqueta: 'Gramo' },
  { valor: 'LITRO', etiqueta: 'Litro' },
  { valor: 'METRO', etiqueta: 'Metro' },
  { valor: 'CAJA', etiqueta: 'Caja' },
];

// Columnas de la tabla
const COLUMNAS: ColumnaConfig<Producto>[] = [
  {
    id: 'codigo',
    titulo: 'Código',
    campo: 'codigo',
    ordenable: true,
    ancho: '120px',
    render: (p) => p.codigo || <span className="text-foreground-muted">—</span>,
  },
  {
    id: 'nombre',
    titulo: 'Nombre',
    campo: 'nombre',
    ordenable: true,
  },
  {
    id: 'precio',
    titulo: 'Precio',
    campo: 'precioConIva',
    ordenable: true,
    alineacion: 'right',
    ancho: '120px',
    render: (p) => `$${p.precioConIva.toLocaleString('es-CL')}`,
  },
  {
    id: 'unidad',
    titulo: 'Unidad',
    campo: 'unidad',
    ordenable: true,
    ancho: '100px',
    render: (p) => UNIDADES.find(u => u.valor === p.unidad)?.etiqueta || p.unidad,
  },
  {
    id: 'stockMinimo',
    titulo: 'Stock Mín.',
    campo: 'stockMinimo',
    ordenable: true,
    alineacion: 'right',
    ancho: '100px',
    render: (p) => p.stockMinimo?.toString() || '—',
  },
  {
    id: 'estado',
    titulo: 'Estado',
    campo: 'activo',
    ordenable: true,
    ancho: '100px',
    render: (p) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        p.activo
          ? 'bg-success/10 text-success'
          : 'bg-foreground-muted/10 text-foreground-muted'
      }`}>
        {p.activo ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

export default function ProductosPage() {
  const { usuario } = useAuth();
  const {
    productos,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    totalElementos,
    porPagina,
    filtros,
    ordenPor,
    ordenDir,
    seleccionados,
    productoEditando,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    crearProducto,
    actualizarProducto,
    desactivarProducto,
    reactivarProducto,
    seleccionarParaEditar,
    seleccionar,
    limpiarSeleccion,
    desactivarMasivo,
    reactivarMasivo,
    limpiarError,
  } = useProductos();

  const {
    vistas,
    vistaActual,
    crearVista,
    seleccionarVista,
    cargarVistas,
    cargarVistaPredeterminada,
  } = useVistas();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesandoMasivo, setProcesandoMasivo] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Filtros locales del toolbar
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.q || '');

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  // Cargar vistas al montar
  useEffect(() => {
    cargarVistas('productos');
    cargarVistaPredeterminada('productos').then(vista => {
      if (vista) {
        // Aplicar filtros de la vista predeterminada
        const config = vista.configuracion;
        if (config.filtros) {
          cambiarFiltros(config.filtros as Partial<typeof filtros>);
        }
        if (config.orden) {
          cambiarOrden(config.orden.campo, config.orden.dir);
        }
      }
    });
  }, [cargarVistas, cargarVistaPredeterminada, cambiarFiltros, cambiarOrden]);

  // Configuración de filtros del toolbar
  const filtrosConfig: FiltroConfig[] = [
    {
      id: 'estado',
      etiqueta: 'Todos los estados',
      opciones: [
        { valor: 'activo', etiqueta: 'Activos' },
        { valor: 'inactivo', etiqueta: 'Inactivos' },
      ],
      valor: filtros.estado || '',
      onChange: (valor) => cambiarFiltros({ estado: valor as 'activo' | 'inactivo' | undefined }),
    },
    {
      id: 'unidad',
      etiqueta: 'Todas las unidades',
      opciones: UNIDADES.map((u) => ({ valor: u.valor, etiqueta: u.etiqueta })),
      valor: filtros.unidad || '',
      onChange: (valor) => cambiarFiltros({ unidad: valor as UnidadProducto | undefined }),
    },
    {
      id: 'stock',
      etiqueta: 'Stock',
      opciones: [
        { valor: 'bajoStock', etiqueta: 'Bajo mínimo' },
        { valor: 'sinStock', etiqueta: 'Sin stock' },
      ],
      valor: filtros.bajoStock ? 'bajoStock' : filtros.sinStock ? 'sinStock' : '',
      onChange: (valor) => {
        cambiarFiltros({
          bajoStock: valor === 'bajoStock' ? true : undefined,
          sinStock: valor === 'sinStock' ? true : undefined,
        });
      },
    },
  ];

  // Acciones masivas
  const accionesMasivas: AccionMasiva<Producto>[] = [
    {
      id: 'desactivar',
      etiqueta: 'Desactivar',
      variante: 'danger',
      confirmar: `¿Desactivar ${seleccionados.length} producto(s)?`,
      icono: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      onEjecutar: async (items) => {
        if (!esAdmin) {
          setErrorLocal('Solo un administrador puede desactivar productos');
          return;
        }
        setProcesandoMasivo(true);
        const resultado = await desactivarMasivo(items.map(p => p.id));
        setProcesandoMasivo(false);
        if (resultado.fallidos > 0) {
          setErrorLocal(`${resultado.exitosos} desactivados, ${resultado.fallidos} fallidos`);
        }
      },
    },
    {
      id: 'reactivar',
      etiqueta: 'Reactivar',
      variante: 'primary',
      confirmar: `¿Reactivar ${seleccionados.length} producto(s)?`,
      icono: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onEjecutar: async (items) => {
        if (!esAdmin) {
          setErrorLocal('Solo un administrador puede reactivar productos');
          return;
        }
        setProcesandoMasivo(true);
        const resultado = await reactivarMasivo(items.map(p => p.id));
        setProcesandoMasivo(false);
        if (resultado.fallidos > 0) {
          setErrorLocal(`${resultado.exitosos} reactivados, ${resultado.fallidos} fallidos`);
        }
      },
    },
  ];

  // Vistas guardadas adaptadas al formato de TablaAvanzada
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
    // Debounce la búsqueda
    const timer = setTimeout(() => {
      cambiarFiltros({ q: texto || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [cambiarFiltros]);

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
      modulo: 'productos',
      nombre: vista.nombre,
      configuracion: {
        columnas: vista.columnas,
        filtros: filtros,
        orden: vista.ordenPor ? { campo: vista.ordenPor, dir: vista.ordenDir || 'asc' } : undefined,
      },
    });
  }, [crearVista, filtros]);

  const exportar = (formato: 'excel' | 'csv') => {
    const datosExportar = seleccionados.length > 0 ? seleccionados : productos;
    const fecha = new Date().toISOString().split('T')[0];

    exportarDatos<Producto>(
      datosExportar,
      [
        { titulo: 'Código', campo: 'codigo', formato: 'texto' },
        { titulo: 'Nombre', campo: 'nombre', formato: 'texto' },
        { titulo: 'Precio con IVA', campo: 'precioConIva', formato: 'moneda' },
        { titulo: 'Unidad', campo: 'unidad', formato: 'texto' },
        { titulo: 'Stock Mínimo', campo: (p) => p.stockMinimo ?? '', formato: 'numero' },
        { titulo: 'Estado', campo: (p) => (p.activo ? 'Activo' : 'Inactivo'), formato: 'texto' },
      ],
      `productos_${fecha}`,
      formato
    );
  };

  const abrirModalNuevo = () => {
    seleccionarParaEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto: Producto) => {
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

  if (cargando && productos.length === 0) {
    return <SpinnerPagina mensaje="Cargando productos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-foreground-muted mt-1">
            {totalElementos} producto{totalElementos !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Button onClick={abrirModalNuevo}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </Button>
      </div>

      {(error || errorLocal) && (
        <Alert tipo="danger" titulo="Error">
          {error || errorLocal}
          <button
            onClick={() => { limpiarError(); setErrorLocal(null); }}
            className="ml-2 underline hover:no-underline"
          >
            Cerrar
          </button>
        </Alert>
      )}

      {/* Toolbar con búsqueda, filtros y exportación */}
      <TablaToolbar
        busqueda={busquedaLocal}
        onBusquedaChange={handleBusqueda}
        placeholderBusqueda="Buscar por nombre o código..."
        filtros={filtrosConfig}
        onExportarExcel={() => exportar('excel')}
        onExportarCSV={() => exportar('csv')}
        totalResultados={totalElementos}
      />

      <div className="bg-background border border-border rounded-[var(--radius)]">
        <TablaAvanzada
          datos={productos}
          columnas={COLUMNAS}
          keyField="id"
          seleccionable={esAdmin}
          seleccionados={seleccionados}
          onSeleccionChange={seleccionar}
          accionesMasivas={esAdmin ? accionesMasivas : []}
          ordenPor={ordenPor}
          ordenDir={ordenDir}
          onOrdenChange={handleOrden}
          onFilaClick={abrirModalEditar}
          vistas={vistasTabla}
          vistaActual={vistaActual?.id}
          onVistaChange={handleVistaChange}
          onVistaGuardar={handleGuardarVista}
          storageKey="productos"
          mensajeVacio="No hay productos"
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
