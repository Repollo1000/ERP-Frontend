'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type {
  ApiError,
  KPIsCompletos,
  ConfiguracionDashboard,
  ConfiguracionWidget,
  WidgetDisponible,
  TipoWidget,
} from '@/types';

// Tipos legacy para compatibilidad con endpoint actual
interface MetricasVentas {
  totalHoy: number;
  totalSemana: number;
  totalMes: number;
  cantidadHoy: number;
  cantidadMes: number;
}

interface MetricasCompras {
  totalMes: number;
  cantidadMes: number;
}

interface ProductoAlerta {
  id: string;
  codigo: string | null;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

interface MetricasInventario {
  productosActivos: number;
  productosBajoMinimo: number;
  productosSinStock: number;
  alertas: ProductoAlerta[];
}

interface VentaDiaria {
  fecha: string;
  total: number;
}

interface TopCliente {
  id: string;
  nombre: string;
  totalCompras: number;
  cantidadCompras: number;
}

export interface ResumenDashboard {
  ventas: MetricasVentas;
  compras: MetricasCompras;
  inventario: MetricasInventario;
  ventasUltimaSemana: VentaDiaria[];
  topClientes: TopCliente[];
}

// Configuración por defecto
const CONFIGURACION_DEFAULT: ConfiguracionDashboard = {
  widgets: [
    { tipo: 'VENTAS_KPI', visible: true, orden: 0 },
    { tipo: 'COMPRAS_KPI', visible: true, orden: 1 },
    { tipo: 'INVENTARIO_KPI', visible: true, orden: 2 },
    { tipo: 'ALERTAS_INVENTARIO', visible: true, orden: 3 },
    { tipo: 'TOP_CLIENTES', visible: true, orden: 4 },
  ],
};

interface UseDashboardReturn {
  // Estado legacy (compatibilidad)
  resumen: ResumenDashboard | null;

  // Estado nuevo
  kpis: KPIsCompletos | null;
  configuracion: ConfiguracionDashboard;
  widgetsDisponibles: WidgetDisponible[];

  // Estado común
  cargando: boolean;
  cargandoConfig: boolean;
  error: string | null;

  // Acciones legacy
  cargarResumen: () => Promise<void>;

  // Acciones nuevas
  cargarKPIs: () => Promise<void>;
  cargarConfiguracion: () => Promise<void>;
  guardarConfiguracion: (config: ConfiguracionDashboard) => Promise<{ exito: boolean; error?: string }>;
  restaurarConfiguracion: () => Promise<{ exito: boolean; error?: string }>;
  cargarWidgetsDisponibles: () => Promise<void>;

  // Helpers para manipular widgets
  toggleWidget: (tipo: TipoWidget) => void;
  moverWidget: (tipo: TipoWidget, nuevaPosicion: number) => void;
  obtenerWidgetsVisibles: () => ConfiguracionWidget[];
}

// Función para convertir respuesta legacy a KPIsCompletos
function convertirLegacyAKPIs(resumen: ResumenDashboard): KPIsCompletos {
  return {
    ventas: {
      hoy: { total: resumen.ventas.totalHoy, cantidad: resumen.ventas.cantidadHoy },
      semana: { total: resumen.ventas.totalSemana, cantidad: 0 },
      mes: { total: resumen.ventas.totalMes, cantidad: resumen.ventas.cantidadMes },
    },
    compras: {
      mes: { total: resumen.compras.totalMes, cantidad: resumen.compras.cantidadMes },
    },
    inventario: {
      productosActivos: resumen.inventario.productosActivos,
      productosBajoMinimo: resumen.inventario.productosBajoMinimo,
      productosSinStock: resumen.inventario.productosSinStock,
      valorEstimado: 0,
    },
    contactos: {
      clientesActivos: 0,
      proveedoresActivos: 0,
      nuevosEsteMes: 0,
    },
    topClientes: resumen.topClientes,
    topProductos: [],
    ultimasVentas: [],
    ultimasCompras: [],
    alertasInventario: resumen.inventario.alertas,
    graficoVentas30D: resumen.ventasUltimaSemana.map(v => ({
      fecha: v.fecha,
      total: v.total,
      cantidad: 0,
    })),
  };
}

export function useDashboard(): UseDashboardReturn {
  const { usuario, cargando: cargandoAuth } = useAuth();

  // Estado legacy
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);

  // Estado nuevo
  const [kpis, setKpis] = useState<KPIsCompletos | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionDashboard>(CONFIGURACION_DEFAULT);
  const [widgetsDisponibles, setWidgetsDisponibles] = useState<WidgetDisponible[]>([]);

  // Estado común
  const [cargando, setCargando] = useState(true);
  const [cargandoConfig, setCargandoConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargadoRef = useRef(false);
  const configCargadaRef = useRef(false);

  // Cargar datos del dashboard (intenta nuevo endpoint, fallback a legacy)
  const cargarKPIs = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      // Intentar primero el nuevo endpoint
      const respuesta = await api.get<KPIsCompletos>('/api/dashboard/kpis');
      setKpis(respuesta);

      // También actualizar resumen legacy para compatibilidad
      setResumen({
        ventas: {
          totalHoy: respuesta.ventas?.hoy?.total || 0,
          totalSemana: respuesta.ventas?.semana?.total || 0,
          totalMes: respuesta.ventas?.mes?.total || 0,
          cantidadHoy: respuesta.ventas?.hoy?.cantidad || 0,
          cantidadMes: respuesta.ventas?.mes?.cantidad || 0,
        },
        compras: {
          totalMes: respuesta.compras?.mes?.total || 0,
          cantidadMes: respuesta.compras?.mes?.cantidad || 0,
        },
        inventario: {
          productosActivos: respuesta.inventario?.productosActivos || 0,
          productosBajoMinimo: respuesta.inventario?.productosBajoMinimo || 0,
          productosSinStock: respuesta.inventario?.productosSinStock || 0,
          alertas: respuesta.alertasInventario || [],
        },
        ventasUltimaSemana: (respuesta.graficoVentas30D || []).slice(-7).map(d => ({
          fecha: d.fecha,
          total: d.total,
        })),
        topClientes: respuesta.topClientes || [],
      });
    } catch {
      // Fallback al endpoint legacy
      try {
        const respuestaLegacy = await api.get<ResumenDashboard>('/api/dashboard');
        setResumen(respuestaLegacy);
        setKpis(convertirLegacyAKPIs(respuestaLegacy));
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error || 'Error al cargar dashboard');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  // Legacy: cargar resumen (mantener compatibilidad)
  const cargarResumen = useCallback(async () => {
    await cargarKPIs();
  }, [cargarKPIs]);

  // Cargar configuración de widgets (con fallback local)
  const cargarConfiguracion = useCallback(async () => {
    setCargandoConfig(true);

    try {
      const respuesta = await api.get<ConfiguracionDashboard>('/api/dashboard/configuracion');
      setConfiguracion(respuesta);
    } catch {
      // Si no hay endpoint de configuración, intentar localStorage
      try {
        const guardado = localStorage.getItem('dashboard_config');
        if (guardado) {
          setConfiguracion(JSON.parse(guardado));
        } else {
          setConfiguracion(CONFIGURACION_DEFAULT);
        }
      } catch {
        setConfiguracion(CONFIGURACION_DEFAULT);
      }
    } finally {
      setCargandoConfig(false);
    }
  }, []);

  // Guardar configuración (con fallback a localStorage)
  const guardarConfiguracion = useCallback(async (config: ConfiguracionDashboard): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.put('/api/dashboard/configuracion', config);
      setConfiguracion(config);
      return { exito: true };
    } catch {
      // Fallback a localStorage si el endpoint no existe
      try {
        localStorage.setItem('dashboard_config', JSON.stringify(config));
        setConfiguracion(config);
        return { exito: true };
      } catch (err) {
        return { exito: false, error: 'Error al guardar configuración' };
      }
    }
  }, []);

  // Restaurar configuración por defecto
  const restaurarConfiguracion = useCallback(async (): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.delete('/api/dashboard/configuracion');
    } catch {
      // Ignorar si no existe el endpoint
    }

    try {
      localStorage.removeItem('dashboard_config');
    } catch {
      // Ignorar errores de localStorage
    }

    setConfiguracion(CONFIGURACION_DEFAULT);
    return { exito: true };
  }, []);

  // Cargar widgets disponibles
  const cargarWidgetsDisponibles = useCallback(async () => {
    // Usar lista por defecto (el endpoint puede no existir)
    setWidgetsDisponibles([
      { tipo: 'VENTAS_KPI', nombre: 'Ventas', descripcion: 'KPIs de ventas', categoria: 'kpi' },
      { tipo: 'COMPRAS_KPI', nombre: 'Compras', descripcion: 'KPIs de compras', categoria: 'kpi' },
      { tipo: 'INVENTARIO_KPI', nombre: 'Inventario', descripcion: 'KPIs de inventario', categoria: 'kpi' },
      { tipo: 'CONTACTOS_KPI', nombre: 'Contactos', descripcion: 'KPIs de contactos', categoria: 'kpi' },
      { tipo: 'GRAFICO_VENTAS_30D', nombre: 'Ventas 30 días', descripcion: 'Gráfico de ventas últimos 30 días', categoria: 'grafico' },
      { tipo: 'ALERTAS_INVENTARIO', nombre: 'Alertas', descripcion: 'Productos con stock bajo', categoria: 'lista' },
      { tipo: 'ULTIMAS_VENTAS', nombre: 'Últimas ventas', descripcion: 'Ventas recientes', categoria: 'lista' },
      { tipo: 'ULTIMAS_COMPRAS', nombre: 'Últimas compras', descripcion: 'Compras recientes', categoria: 'lista' },
      { tipo: 'TOP_CLIENTES', nombre: 'Top clientes', descripcion: 'Mejores clientes del mes', categoria: 'lista' },
      { tipo: 'TOP_PRODUCTOS', nombre: 'Top productos', descripcion: 'Productos más vendidos', categoria: 'lista' },
    ]);
  }, []);

  // Helpers para manipular widgets
  const toggleWidget = useCallback((tipo: TipoWidget) => {
    setConfiguracion(prev => ({
      ...prev,
      widgets: prev.widgets.map(w =>
        w.tipo === tipo ? { ...w, visible: !w.visible } : w
      ),
    }));
  }, []);

  const moverWidget = useCallback((tipo: TipoWidget, nuevaPosicion: number) => {
    setConfiguracion(prev => {
      const widgets = [...prev.widgets];
      const index = widgets.findIndex(w => w.tipo === tipo);
      if (index === -1) return prev;

      const [widget] = widgets.splice(index, 1);
      widgets.splice(nuevaPosicion, 0, widget);

      // Actualizar órdenes
      return {
        ...prev,
        widgets: widgets.map((w, i) => ({ ...w, orden: i })),
      };
    });
  }, []);

  const obtenerWidgetsVisibles = useCallback(() => {
    return configuracion.widgets
      .filter(w => w.visible)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  }, [configuracion]);

  // Cargar datos iniciales
  useEffect(() => {
    if (cargandoAuth) return;

    if (usuario?.empresaActiva && !cargadoRef.current) {
      cargadoRef.current = true;
      cargarKPIs();
    } else if (!usuario?.empresaActiva) {
      setCargando(false);
    }
  }, [usuario, cargandoAuth, cargarKPIs]);

  // Cargar configuración
  useEffect(() => {
    if (cargandoAuth) return;

    if (usuario?.empresaActiva && !configCargadaRef.current) {
      configCargadaRef.current = true;
      cargarConfiguracion();
      cargarWidgetsDisponibles();
    }
  }, [usuario, cargandoAuth, cargarConfiguracion, cargarWidgetsDisponibles]);

  return {
    // Legacy
    resumen,
    cargarResumen,

    // Nuevo
    kpis,
    configuracion,
    widgetsDisponibles,
    cargarKPIs,
    cargarConfiguracion,
    guardarConfiguracion,
    restaurarConfiguracion,
    cargarWidgetsDisponibles,

    // Helpers
    toggleWidget,
    moverWidget,
    obtenerWidgetsVisibles,

    // Común
    cargando,
    cargandoConfig,
    error,
  };
}
