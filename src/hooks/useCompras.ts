'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Compra, SolicitudCompra, ApiError } from '@/types';

type RespuestaListaCompras = Compra[];

interface RespuestaCrearCompra {
  id: string;
}

interface UseComprasReturn {
  compras: Compra[];
  cargando: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  compraSeleccionada: Compra | null;

  cargarCompras: () => Promise<void>;
  cambiarPagina: (pagina: number) => void;
  crearCompra: (datos: SolicitudCompra) => Promise<{ exito: boolean; error?: string; id?: string }>;
  anularCompra: (id: string, motivo: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarCompra: (compra: Compra | null) => void;
  limpiarError: () => void;
}

export function useCompras(): UseComprasReturn {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);

  const cargarCompras = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaActual.toString());

      const respuesta = await api.get<RespuestaListaCompras>(
        `/api/compras?${params.toString()}`
      );

      setCompras(respuesta);
      setTotalPaginas(respuesta.length >= 50 ? paginaActual + 2 : paginaActual + 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar compras');
    } finally {
      setCargando(false);
    }
  }, [paginaActual]);

  useEffect(() => {
    cargarCompras();
  }, [cargarCompras]);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
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
    compraSeleccionada,
    cargarCompras,
    cambiarPagina,
    crearCompra,
    anularCompra,
    seleccionarCompra,
    limpiarError,
  };
}
