'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type {
  Venta,
  SolicitudVenta,
  ApiError,
  RespuestaPaginada,
  FiltrosVentas,
  DireccionOrden,
} from '@/types';

interface RespuestaCrearVenta {
  id: string;
}

interface UseVentasReturn {
  // Estado
  ventas: Venta[];
  cargando: boolean;
  error: string | null;

  // Paginación (con metadata real del backend)
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;

  // Filtros y ordenamiento
  filtros: FiltrosVentas;
  ordenPor: string;
  ordenDir: DireccionOrden;

  // Selección
  ventaSeleccionada: Venta | null;

  // Acciones
  cargarVentas: () => Promise<void>;
  cambiarFiltros: (nuevosFiltros: Partial<FiltrosVentas>) => void;
  cambiarOrden: (campo: string, direccion: DireccionOrden) => void;
  cambiarPagina: (pagina: number) => void;
  cambiarPorPagina: (cantidad: number) => void;
  crearVenta: (datos: SolicitudVenta) => Promise<{ exito: boolean; error?: string; id?: string }>;
  anularVenta: (id: string, motivo: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarVenta: (venta: Venta | null) => void;
  limpiarError: () => void;
}

const FILTROS_INICIALES: FiltrosVentas = {
  pagina: 0,
  porPagina: 20,
  ordenPor: 'emitidaEn',
  ordenDir: 'desc',
};

export function useVentas(): UseVentasReturn {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [porPagina, setPorPagina] = useState(20);

  // Filtros y ordenamiento
  const [filtros, setFiltros] = useState<FiltrosVentas>(FILTROS_INICIALES);
  const [ordenPor, setOrdenPor] = useState('emitidaEn');
  const [ordenDir, setOrdenDir] = useState<DireccionOrden>('desc');

  // Selección
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  const inicializadoRef = useRef(false);

  const cargarVentas = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Paginación
      params.set('pagina', paginaActual.toString());
      params.set('porPagina', porPagina.toString());

      // Ordenamiento
      params.set('ordenPor', ordenPor);
      params.set('ordenDir', ordenDir);

      // Filtros
      if (filtros.desde) params.set('desde', filtros.desde);
      if (filtros.hasta) params.set('hasta', filtros.hasta);
      if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
      if (filtros.estado) params.set('estado', filtros.estado);

      const respuesta = await api.get<RespuestaPaginada<Venta>>(
        `/api/ventas?${params.toString()}`
      );

      // Parsear respuesta paginada con metadata real
      setVentas(respuesta.contenido);
      setTotalPaginas(respuesta.totalPaginas);
      setTotalElementos(respuesta.totalElementos);
      setPorPagina(respuesta.porPagina);
      setPaginaActual(respuesta.pagina);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar ventas');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, porPagina, ordenPor, ordenDir, filtros]);

  useEffect(() => {
    if (cargandoAuth) return;

    if (usuario?.empresaActiva) {
      if (!inicializadoRef.current) {
        inicializadoRef.current = true;
      }
      cargarVentas();
    }
  }, [usuario, cargandoAuth, cargarVentas]);

  const cambiarFiltros = useCallback((nuevosFiltros: Partial<FiltrosVentas>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setPaginaActual(0);
  }, []);

  const cambiarOrden = useCallback((campo: string, direccion: DireccionOrden) => {
    setOrdenPor(campo);
    setOrdenDir(direccion);
    setPaginaActual(0);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  const cambiarPorPagina = useCallback((cantidad: number) => {
    setPorPagina(cantidad);
    setPaginaActual(0);
  }, []);

  const crearVenta = useCallback(async (datos: SolicitudVenta): Promise<{ exito: boolean; error?: string; id?: string }> => {
    try {
      const respuesta = await api.post<RespuestaCrearVenta>('/api/ventas', datos);
      await cargarVentas();
      return { exito: true, id: respuesta.id };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'stock_insuficiente') {
        return { exito: false, error: 'Stock insuficiente para uno o más productos' };
      }
      if (apiError.error === 'producto_no_encontrado') {
        return { exito: false, error: 'Uno de los productos ya no existe' };
      }
      if (apiError.error === 'cliente_no_encontrado') {
        return { exito: false, error: 'El cliente seleccionado ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al crear venta' };
    }
  }, [cargarVentas]);

  const anularVenta = useCallback(async (id: string, motivo: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/ventas/${id}/anular`, { motivo });
      await cargarVentas();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede anular ventas' };
      }
      if (apiError.error === 'venta_ya_anulada') {
        return { exito: false, error: 'Esta venta ya está anulada' };
      }
      if (apiError.error === 'venta_no_encontrada') {
        return { exito: false, error: 'La venta ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al anular venta' };
    }
  }, [cargarVentas]);

  const seleccionarVenta = useCallback((venta: Venta | null) => {
    setVentaSeleccionada(venta);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ventas,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    totalElementos,
    porPagina,
    filtros,
    ordenPor,
    ordenDir,
    ventaSeleccionada,
    cargarVentas,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    cambiarPorPagina,
    crearVenta,
    anularVenta,
    seleccionarVenta,
    limpiarError,
  };
}
