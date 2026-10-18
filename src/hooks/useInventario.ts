'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Producto, Kardex, SolicitudMovimiento, ApiError } from '@/types';

interface ProductoConStock extends Producto {
  stock: number;
}

type RespuestaListaProductos = ProductoConStock[];

interface UseInventarioReturn {
  productos: ProductoConStock[];
  kardex: Kardex | null;
  productoSeleccionado: ProductoConStock | null;
  cargando: boolean;
  cargandoKardex: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  busqueda: string;

  cargarProductos: () => Promise<void>;
  buscar: (texto: string) => void;
  cambiarPagina: (pagina: number) => void;
  seleccionarProducto: (producto: ProductoConStock | null) => void;
  cargarKardex: (productoId: string) => Promise<void>;
  crearMovimiento: (productoId: string, datos: SolicitudMovimiento) => Promise<{ exito: boolean; error?: string }>;
  limpiarError: () => void;
}

export function useInventario(): UseInventarioReturn {
  const [productos, setProductos] = useState<ProductoConStock[]>([]);
  const [kardex, setKardex] = useState<Kardex | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConStock | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoKardex, setCargandoKardex] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaActual.toString());
      params.set('incluirStock', 'true');
      if (busqueda) {
        params.set('q', busqueda);
      }

      const respuesta = await api.get<RespuestaListaProductos>(
        `/api/productos?${params.toString()}`
      );

      setProductos(respuesta);
      setTotalPaginas(respuesta.length >= 50 ? paginaActual + 2 : paginaActual + 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, busqueda]);

  const buscar = useCallback((texto: string) => {
    setBusqueda(texto);
    setPaginaActual(0);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  const seleccionarProducto = useCallback((producto: ProductoConStock | null) => {
    setProductoSeleccionado(producto);
    if (!producto) {
      setKardex(null);
    }
  }, []);

  const cargarKardex = useCallback(async (productoId: string) => {
    setCargandoKardex(true);
    setError(null);

    try {
      const respuesta = await api.get<Kardex>(`/api/productos/${productoId}/kardex`);
      setKardex(respuesta);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar kardex');
    } finally {
      setCargandoKardex(false);
    }
  }, []);

  const crearMovimiento = useCallback(async (productoId: string, datos: SolicitudMovimiento): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/productos/${productoId}/movimientos`, datos);
      await cargarKardex(productoId);
      await cargarProductos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede hacer ajustes de inventario' };
      }
      if (apiError.error === 'stock_insuficiente') {
        return { exito: false, error: 'Stock insuficiente para este ajuste' };
      }
      if (apiError.error === 'producto_no_encontrado') {
        return { exito: false, error: 'El producto ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al crear movimiento' };
    }
  }, [cargarKardex, cargarProductos]);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    productos,
    kardex,
    productoSeleccionado,
    cargando,
    cargandoKardex,
    error,
    paginaActual,
    totalPaginas,
    busqueda,
    cargarProductos,
    buscar,
    cambiarPagina,
    seleccionarProducto,
    cargarKardex,
    crearMovimiento,
    limpiarError,
  };
}
