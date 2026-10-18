'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Producto, DatosProducto, ApiError } from '@/types';

// El backend retorna array simple, sin metadatos de paginación
type RespuestaListaProductos = Producto[];

interface RespuestaCrearProducto {
  id: string;
}

interface UseProductosReturn {
  // Estado
  productos: Producto[];
  cargando: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  busqueda: string;

  // Producto seleccionado para editar
  productoEditando: Producto | null;

  // Acciones
  cargarProductos: () => Promise<void>;
  buscar: (texto: string) => void;
  cambiarPagina: (pagina: number) => void;
  crearProducto: (datos: DatosProducto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  actualizarProducto: (id: string, datos: DatosProducto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  desactivarProducto: (id: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarParaEditar: (producto: Producto | null) => void;
  limpiarError: () => void;
}

export function useProductos(): UseProductosReturn {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaActual.toString());
      if (busqueda) {
        params.set('q', busqueda);
      }

      const respuesta = await api.get<RespuestaListaProductos>(
        `/api/productos?${params.toString()}`
      );

      // Backend retorna array simple
      setProductos(respuesta);
      // Sin metadatos de paginación, asumimos una página si hay menos de 50
      setTotalPaginas(respuesta.length >= 50 ? paginaActual + 2 : paginaActual + 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, busqueda]);

  // Cargar productos al montar o cambiar página/búsqueda
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const buscar = useCallback((texto: string) => {
    setBusqueda(texto);
    setPaginaActual(0); // Reiniciar a primera página al buscar
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
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

  const seleccionarParaEditar = useCallback((producto: Producto | null) => {
    setProductoEditando(producto);
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
    busqueda,
    productoEditando,
    cargarProductos,
    buscar,
    cambiarPagina,
    crearProducto,
    actualizarProducto,
    desactivarProducto,
    seleccionarParaEditar,
    limpiarError,
  };
}
