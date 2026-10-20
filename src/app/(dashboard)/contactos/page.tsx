'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Alert, Paginacion, SpinnerPagina, TablaToolbar, TablaAvanzada } from '@/components/ui';
import type { FiltroConfig, ColumnaConfig, AccionMasiva, VistaGuardada } from '@/components/ui';
import { ModalContacto } from '@/components/contactos';
import { useContactos } from '@/hooks/useContactos';
import { useVistas } from '@/hooks/useVistas';
import { useAuth } from '@/hooks/useAuth';
import { exportarDatos } from '@/lib/exportar';
import type { DatosContacto, Contacto, DireccionOrden } from '@/types';

// Columnas de la tabla
const COLUMNAS: ColumnaConfig<Contacto>[] = [
  {
    id: 'nombre',
    titulo: 'Nombre',
    campo: 'nombre',
    ordenable: true,
  },
  {
    id: 'rut',
    titulo: 'RUT',
    campo: 'rut',
    ordenable: true,
    ancho: '120px',
    render: (c) => c.rut || <span className="text-foreground-muted">—</span>,
  },
  {
    id: 'email',
    titulo: 'Email',
    campo: 'email',
    ordenable: true,
    render: (c) => c.email || <span className="text-foreground-muted">—</span>,
  },
  {
    id: 'telefono',
    titulo: 'Teléfono',
    campo: 'telefono',
    ancho: '130px',
    render: (c) => c.telefono || <span className="text-foreground-muted">—</span>,
  },
  {
    id: 'tipo',
    titulo: 'Tipo',
    campo: (c) => {
      const tipos = [];
      if (c.esCliente) tipos.push('Cliente');
      if (c.esProveedor) tipos.push('Proveedor');
      return tipos.join(', ') || '—';
    },
    ancho: '140px',
    render: (c) => (
      <div className="flex gap-1">
        {c.esCliente && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Cliente
          </span>
        )}
        {c.esProveedor && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
            Proveedor
          </span>
        )}
      </div>
    ),
  },
  {
    id: 'estado',
    titulo: 'Estado',
    campo: 'activo',
    ordenable: true,
    ancho: '100px',
    render: (c) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        c.activo
          ? 'bg-success/10 text-success'
          : 'bg-foreground-muted/10 text-foreground-muted'
      }`}>
        {c.activo ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

export default function ContactosPage() {
  const { usuario } = useAuth();
  const {
    contactos,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    totalElementos,
    filtros,
    ordenPor,
    ordenDir,
    seleccionados,
    contactoEditando,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    crearContacto,
    actualizarContacto,
    desactivarContacto,
    reactivarContacto,
    seleccionarParaEditar,
    seleccionar,
    desactivarMasivo,
    reactivarMasivo,
    limpiarError,
  } = useContactos();

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
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Filtros locales del toolbar
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.q || '');

  const esAdmin = usuario?.empresaActiva?.rol === 'ADMINISTRADOR';

  // Cargar vistas al montar
  useEffect(() => {
    cargarVistas('contactos');
    cargarVistaPredeterminada('contactos').then(vista => {
      if (vista) {
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
      id: 'tipo',
      etiqueta: 'Todos los tipos',
      opciones: [
        { valor: 'cliente', etiqueta: 'Clientes' },
        { valor: 'proveedor', etiqueta: 'Proveedores' },
      ],
      valor: filtros.tipo || '',
      onChange: (valor) => cambiarFiltros({ tipo: valor as 'cliente' | 'proveedor' | undefined }),
    },
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
  ];

  // Acciones masivas
  const accionesMasivas: AccionMasiva<Contacto>[] = [
    {
      id: 'desactivar',
      etiqueta: 'Desactivar',
      variante: 'danger',
      confirmar: `¿Desactivar ${seleccionados.length} contacto(s)?`,
      icono: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      onEjecutar: async (items) => {
        if (!esAdmin) {
          setErrorLocal('Solo un administrador puede desactivar contactos');
          return;
        }
        const resultado = await desactivarMasivo(items.map(c => c.id));
        if (resultado.fallidos > 0) {
          setErrorLocal(`${resultado.exitosos} desactivados, ${resultado.fallidos} fallidos`);
        }
      },
    },
    {
      id: 'reactivar',
      etiqueta: 'Reactivar',
      variante: 'primary',
      confirmar: `¿Reactivar ${seleccionados.length} contacto(s)?`,
      icono: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onEjecutar: async (items) => {
        if (!esAdmin) {
          setErrorLocal('Solo un administrador puede reactivar contactos');
          return;
        }
        const resultado = await reactivarMasivo(items.map(c => c.id));
        if (resultado.fallidos > 0) {
          setErrorLocal(`${resultado.exitosos} reactivados, ${resultado.fallidos} fallidos`);
        }
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
      modulo: 'contactos',
      nombre: vista.nombre,
      configuracion: {
        columnas: vista.columnas,
        filtros: filtros,
        orden: vista.ordenPor ? { campo: vista.ordenPor, dir: vista.ordenDir || 'asc' } : undefined,
      },
    });
  }, [crearVista, filtros]);

  const exportar = (formato: 'excel' | 'csv') => {
    const datosExportar = seleccionados.length > 0 ? seleccionados : contactos;
    const fecha = new Date().toISOString().split('T')[0];

    exportarDatos<Contacto>(
      datosExportar,
      [
        { titulo: 'Nombre', campo: 'nombre', formato: 'texto' },
        { titulo: 'RUT', campo: (c) => c.rut || '', formato: 'texto' },
        { titulo: 'Email', campo: (c) => c.email || '', formato: 'texto' },
        { titulo: 'Teléfono', campo: (c) => c.telefono || '', formato: 'texto' },
        { titulo: 'Dirección', campo: (c) => c.direccion || '', formato: 'texto' },
        { titulo: 'Es Cliente', campo: (c) => (c.esCliente ? 'Sí' : 'No'), formato: 'texto' },
        { titulo: 'Es Proveedor', campo: (c) => (c.esProveedor ? 'Sí' : 'No'), formato: 'texto' },
        { titulo: 'Estado', campo: (c) => (c.activo ? 'Activo' : 'Inactivo'), formato: 'texto' },
      ],
      `contactos_${fecha}`,
      formato
    );
  };

  const abrirModalNuevo = () => {
    seleccionarParaEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (contacto: Contacto) => {
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

  if (cargando && contactos.length === 0) {
    return <SpinnerPagina mensaje="Cargando contactos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-foreground-muted mt-1">
            {totalElementos} contacto{totalElementos !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Button onClick={abrirModalNuevo}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo contacto
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

      {/* Toolbar */}
      <TablaToolbar
        busqueda={busquedaLocal}
        onBusquedaChange={handleBusqueda}
        placeholderBusqueda="Buscar por nombre, RUT o email..."
        filtros={filtrosConfig}
        onExportarExcel={() => exportar('excel')}
        onExportarCSV={() => exportar('csv')}
        totalResultados={totalElementos}
      />

      <div className="bg-background border border-border rounded-[var(--radius)]">
        <TablaAvanzada
          datos={contactos}
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
          storageKey="contactos"
          mensajeVacio="No hay contactos"
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
