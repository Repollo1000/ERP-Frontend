'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type {
  Compra,
  SolicitudCompra,
  ApiError,
  RespuestaPaginada,
  FiltrosCompras,
  DireccionOrden,
} from '@/types';

interface RespuestaCrearCompra {
  id: string;
}

interface UseComprasReturn {
  // Estado
  compras: Compra[];
  cargando: boolean;
  error: string | null;

  // Paginación (con metadata real del backend)
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;

  // Filtros y ordenamiento
  filtros: FiltrosCompras;
  ordenPor: string;
  ordenDir: DireccionOrden;

  // Selección
  compraSeleccionada: Compra | null;

  // Acciones
  cargarCompras: () => Promise<void>;
  cambiarFiltros: (nuevosFiltros: Partial<FiltrosCompras>) => void;
  cambiarOrden: (campo: string, direccion: DireccionOrden) => void;
  cambiarPagina: (pagina: number) => void;
  cambiarPorPagina: (cantidad: number) => void;
  crearCompra: (datos: SolicitudCompra) => Promise<{ exito: boolean; error?: string; id?: string }>;
  anularCompra: (id: string, motivo: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarCompra: (compra: Compra | null) => void;
  limpiarError: () => void;
}

const FILTROS_INICIALES: FiltrosCompras = {
  pagina: 0,
  porPagina: 20,
  ordenPor: 'fecha',
  ordenDir: 'desc',
};

export function useCompras(): UseComprasReturn {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [porPagina, setPorPagina] = useState(20);

  // Filtros y ordenamiento
  const [filtros, setFiltros] = useState<FiltrosCompras>(FILTROS_INICIALES);
  const [ordenPor, setOrdenPor] = useState('fecha');
  const [ordenDir, setOrdenDir] = useState<DireccionOrden>('desc');

  // Selección
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);

  const inicializadoRef = useRef(false);

  const cargarCompras = useCallback(async () => {
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
      if (filtros.proveedorId) params.set('proveedorId', filtros.proveedorId);
      if (filtros.estado) params.set('estado', filtros.estado);
      if (filtros.folio) params.set('folio', filtros.folio);

      const respuesta = await api.get<RespuestaPaginada<Compra>>(
        `/api/compras?${params.toString()}`
      );

      // Parsear respuesta paginada con metadata real
      setCompras(respuesta.contenido);
      setTotalPaginas(respuesta.totalPaginas);
      setTotalElementos(respuesta.totalElementos);
      setPorPagina(respuesta.porPagina);
      setPaginaActual(respuesta.pagina);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar compras');
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
      cargarCompras();
    }
  }, [usuario, cargandoAuth, cargarCompras]);

  const cambiarFiltros = useCallback((nuevosFiltros: Partial<FiltrosCompras>) => {
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

  const crearCompra = useCallback(async (datos: SolicitudCompra): Promise<{ exito: boolean; error?: string; id?: string }> => {
    try {
      const respuesta = await api.post<RespuestaCrearCompra>('/api/compras', datos);
      await cargarCompras();
      return { exito: true, id: respuesta.id };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'producto_no_encontrado') {
        return { exito: false, error: 'Uno de los productos ya no existe' };
      }
      if (apiError.error === 'proveedor_no_encontrado') {
        return { exito: false, error: 'El proveedor seleccionado ya no existe' };
      }
      if (apiError.error === 'folio_duplicado') {
        return { exito: false, error: 'Ya existe una compra con este folio para el proveedor' };
      }
      return { exito: false, error: apiError.error || 'Error al crear compra' };
    }
  }, [cargarCompras]);

  const anularCompra = useCallback(async (id: string, motivo: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/compras/${id}/anular`, { motivo });
      await cargarCompras();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede anular compras' };
      }
      if (apiError.error === 'compra_ya_anulada') {
        return { exito: false, error: 'Esta compra ya está anulada' };
      }
      if (apiError.error === 'compra_no_encontrada') {
        return { exito: false, error: 'La compra ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al anular compra' };
    }
  }, [cargarCompras]);

  const seleccionarCompra = useCallback((compra: Compra | null) => {
    setCompraSeleccionada(compra);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    compras,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    totalElementos,
    porPagina,
    filtros,
    ordenPor,
    ordenDir,
    compraSeleccionada,
    cargarCompras,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    cambiarPorPagina,
    crearCompra,
    anularCompra,
    seleccionarCompra,
    limpiarError,
  };
}
