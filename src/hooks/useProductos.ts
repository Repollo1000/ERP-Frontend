'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type {
  Producto,
  DatosProducto,
  ApiError,
  RespuestaPaginada,
  FiltrosProductos,
  DireccionOrden,
  RespuestaAccionMasiva,
  SolicitudAccionMasiva,
} from '@/types';

interface RespuestaCrearProducto {
  id: string;
}

interface UseProductosReturn {
  // Estado
  productos: Producto[];
  cargando: boolean;
  error: string | null;

  // Paginación (con metadata real del backend)
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;

  // Filtros y ordenamiento
  filtros: FiltrosProductos;
  ordenPor: string;
  ordenDir: DireccionOrden;

  // Selección múltiple
  seleccionados: Producto[];

  // Producto seleccionado para editar
  productoEditando: Producto | null;

  // Acciones
  cargarProductos: () => Promise<void>;
  cambiarFiltros: (nuevosFiltros: Partial<FiltrosProductos>) => void;
  cambiarOrden: (campo: string, direccion: DireccionOrden) => void;
  cambiarPagina: (pagina: number) => void;
  cambiarPorPagina: (cantidad: number) => void;
  crearProducto: (datos: DatosProducto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  actualizarProducto: (id: string, datos: DatosProducto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  desactivarProducto: (id: string) => Promise<{ exito: boolean; error?: string }>;
  reactivarProducto: (id: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarParaEditar: (producto: Producto | null) => void;
  limpiarError: () => void;

  // Selección múltiple
  seleccionar: (productos: Producto[]) => void;
  limpiarSeleccion: () => void;

  // Acciones masivas
  desactivarMasivo: (ids: string[]) => Promise<RespuestaAccionMasiva>;
  reactivarMasivo: (ids: string[]) => Promise<RespuestaAccionMasiva>;
}

const FILTROS_INICIALES: FiltrosProductos = {
  pagina: 0,
  porPagina: 20,
  ordenPor: 'nombre',
  ordenDir: 'asc',
};

export function useProductos(): UseProductosReturn {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [porPagina, setPorPagina] = useState(20);

  // Filtros y ordenamiento
  const [filtros, setFiltros] = useState<FiltrosProductos>(FILTROS_INICIALES);
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [ordenDir, setOrdenDir] = useState<DireccionOrden>('asc');

  // Selección
  const [seleccionados, setSeleccionados] = useState<Producto[]>([]);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  const inicializadoRef = useRef(false);

  const cargarProductos = useCallback(async () => {
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
      if (filtros.q) params.set('q', filtros.q);
      if (filtros.estado) params.set('estado', filtros.estado);
      if (filtros.unidad) params.set('unidad', filtros.unidad);
      if (filtros.precioMin !== undefined) params.set('precioMin', filtros.precioMin.toString());
      if (filtros.precioMax !== undefined) params.set('precioMax', filtros.precioMax.toString());
      if (filtros.bajoStock) params.set('bajoStock', 'true');
      if (filtros.sinStock) params.set('sinStock', 'true');

      const respuesta = await api.get<RespuestaPaginada<Producto>>(
        `/api/productos?${params.toString()}`
      );

      // Parsear respuesta paginada con metadata real
      setProductos(respuesta.contenido);
      setTotalPaginas(respuesta.totalPaginas);
      setTotalElementos(respuesta.totalElementos);
      setPorPagina(respuesta.porPagina);
      setPaginaActual(respuesta.pagina);

      // Limpiar selección al cambiar datos
      setSeleccionados([]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, porPagina, ordenPor, ordenDir, filtros]);

  // Cargar productos cuando el usuario esté autenticado
  useEffect(() => {
    if (cargandoAuth) return;

    if (usuario?.empresaActiva) {
      if (!inicializadoRef.current) {
        inicializadoRef.current = true;
      }
      cargarProductos();
    }
  }, [usuario, cargandoAuth, cargarProductos]);

  const cambiarFiltros = useCallback((nuevosFiltros: Partial<FiltrosProductos>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setPaginaActual(0); // Reiniciar a primera página al filtrar
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

  const crearProducto = useCallback(async (datos: DatosProducto): Promise<{ exito: boolean; error?: string; campo?: string }> => {
    try {
      await api.post<RespuestaCrearProducto>('/api/productos', datos);
      await cargarProductos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'codigo_duplicado') {
        return { exito: false, error: 'Este código ya está en uso', campo: 'codigo' };
      }
      return { exito: false, error: apiError.error || 'Error al crear producto' };
    }
  }, [cargarProductos]);

  const actualizarProducto = useCallback(async (id: string, datos: DatosProducto): Promise<{ exito: boolean; error?: string; campo?: string }> => {
    try {
      await api.put(`/api/productos/${id}`, datos);
      await cargarProductos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'codigo_duplicado') {
        return { exito: false, error: 'Este código ya está en uso', campo: 'codigo' };
      }
      if (apiError.error === 'producto_no_encontrado') {
        return { exito: false, error: 'El producto ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al actualizar producto' };
    }
  }, [cargarProductos]);

  const desactivarProducto = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/productos/${id}/desactivar`);
      await cargarProductos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede desactivar productos' };
      }
      if (apiError.error === 'producto_no_encontrado') {
        return { exito: false, error: 'El producto ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al desactivar producto' };
    }
  }, [cargarProductos]);

  const reactivarProducto = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/productos/${id}/reactivar`);
      await cargarProductos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede reactivar productos' };
      }
      if (apiError.error === 'producto_no_encontrado') {
        return { exito: false, error: 'El producto ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al reactivar producto' };
    }
  }, [cargarProductos]);

  // Acciones masivas
  const desactivarMasivo = useCallback(async (ids: string[]): Promise<RespuestaAccionMasiva> => {
    try {
      const respuesta = await api.post<RespuestaAccionMasiva>(
        '/api/productos/masivo/desactivar',
        { ids } as SolicitudAccionMasiva
      );
      await cargarProductos();
      setSeleccionados([]);
      return respuesta;
    } catch (err) {
      const apiError = err as ApiError;
      return {
        exitosos: 0,
        fallidos: ids.length,
        errores: [apiError.error || 'Error al desactivar productos'],
      };
    }
  }, [cargarProductos]);

  const reactivarMasivo = useCallback(async (ids: string[]): Promise<RespuestaAccionMasiva> => {
    try {
      const respuesta = await api.post<RespuestaAccionMasiva>(
        '/api/productos/masivo/reactivar',
        { ids } as SolicitudAccionMasiva
      );
      await cargarProductos();
      setSeleccionados([]);
      return respuesta;
    } catch (err) {
      const apiError = err as ApiError;
      return {
        exitosos: 0,
        fallidos: ids.length,
        errores: [apiError.error || 'Error al reactivar productos'],
      };
    }
  }, [cargarProductos]);

  const seleccionarParaEditar = useCallback((producto: Producto | null) => {
    setProductoEditando(producto);
  }, []);

  const seleccionar = useCallback((productos: Producto[]) => {
    setSeleccionados(productos);
  }, []);

  const limpiarSeleccion = useCallback(() => {
    setSeleccionados([]);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
    cargarProductos,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    cambiarPorPagina,
    crearProducto,
    actualizarProducto,
    desactivarProducto,
    reactivarProducto,
    seleccionarParaEditar,
    limpiarError,
    seleccionar,
    limpiarSeleccion,
    desactivarMasivo,
    reactivarMasivo,
  };
}
