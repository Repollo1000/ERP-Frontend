'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type { Producto, Kardex, SolicitudMovimiento, ApiError, RespuestaPaginada } from '@/types';

interface ProductoConStock extends Producto {
  stock: number;
}

interface UseInventarioReturn {
  productos: ProductoConStock[];
  kardex: Kardex | null;
  productoSeleccionado: ProductoConStock | null;
  cargando: boolean;
  cargandoKardex: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
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
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [productos, setProductos] = useState<ProductoConStock[]>([]);
  const [kardex, setKardex] = useState<Kardex | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConStock | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoKardex, setCargandoKardex] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const inicializadoRef = useRef(false);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaActual.toString());
      params.set('porPagina', '20');
      params.set('incluirStock', 'true');
      if (busqueda) {
        params.set('q', busqueda);
      }

      const respuesta = await api.get<RespuestaPaginada<ProductoConStock>>(
        `/api/productos?${params.toString()}`
      );

      // Manejar respuesta paginada
      setProductos(respuesta.contenido);
      setTotalPaginas(respuesta.totalPaginas);
      setTotalElementos(respuesta.totalElementos);
      setPaginaActual(respuesta.pagina);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, busqueda]);

  // Cargar cuando el usuario esté autenticado
  useEffect(() => {
    if (cargandoAuth) return;

    if (usuario?.empresaActiva) {
      if (!inicializadoRef.current) {
        inicializadoRef.current = true;
      }
      cargarProductos();
    }
  }, [usuario, cargandoAuth, cargarProductos]);

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
    totalElementos,
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
