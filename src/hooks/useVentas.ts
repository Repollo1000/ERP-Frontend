'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Venta, SolicitudVenta, ApiError } from '@/types';

type RespuestaListaVentas = Venta[];

interface RespuestaCrearVenta {
  id: string;
}

interface UseVentasReturn {
  ventas: Venta[];
  cargando: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  ventaSeleccionada: Venta | null;

  cargarVentas: () => Promise<void>;
  cambiarPagina: (pagina: number) => void;
  crearVenta: (datos: SolicitudVenta) => Promise<{ exito: boolean; error?: string; id?: string }>;
  anularVenta: (id: string, motivo: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarVenta: (venta: Venta | null) => void;
  limpiarError: () => void;
}

export function useVentas(): UseVentasReturn {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  const cargarVentas = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaActual.toString());

      const respuesta = await api.get<RespuestaListaVentas>(
        `/api/ventas?${params.toString()}`
      );

      setVentas(respuesta);
      setTotalPaginas(respuesta.length >= 50 ? paginaActual + 2 : paginaActual + 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar ventas');
    } finally {
      setCargando(false);
    }
  }, [paginaActual]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
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
    ventaSeleccionada,
    cargarVentas,
    cambiarPagina,
    crearVenta,
    anularVenta,
    seleccionarVenta,
    limpiarError,
  };
}
