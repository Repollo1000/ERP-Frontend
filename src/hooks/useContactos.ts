'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Contacto, DatosContacto, ApiError } from '@/types';

// El backend retorna array simple
type RespuestaListaContactos = Contacto[];

interface RespuestaCrearContacto {
  id: string;
}

type FiltroTipo = 'todos' | 'clientes' | 'proveedores';

interface UseContactosReturn {
  contactos: Contacto[];
  cargando: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  busqueda: string;
  filtroTipo: FiltroTipo;
  contactoEditando: Contacto | null;

  cargarContactos: () => Promise<void>;
  buscar: (texto: string) => void;
  filtrarPorTipo: (tipo: FiltroTipo) => void;
  cambiarPagina: (pagina: number) => void;
  crearContacto: (datos: DatosContacto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  actualizarContacto: (id: string, datos: DatosContacto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  desactivarContacto: (id: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarParaEditar: (contacto: Contacto | null) => void;
  limpiarError: () => void;
}

export function useContactos(): UseContactosReturn {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [contactoEditando, setContactoEditando] = useState<Contacto | null>(null);

  const cargarContactos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaActual.toString());
      if (busqueda) {
        params.set('q', busqueda);
      }
      if (filtroTipo === 'clientes') {
        params.set('tipo', 'cliente');
      } else if (filtroTipo === 'proveedores') {
        params.set('tipo', 'proveedor');
      }

      const respuesta = await api.get<RespuestaListaContactos>(
        `/api/contactos?${params.toString()}`
      );

      setContactos(respuesta);
      setTotalPaginas(respuesta.length >= 50 ? paginaActual + 2 : paginaActual + 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar contactos');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, busqueda, filtroTipo]);

  useEffect(() => {
    cargarContactos();
  }, [cargarContactos]);

  const buscar = useCallback((texto: string) => {
    setBusqueda(texto);
    setPaginaActual(0);
  }, []);

  const filtrarPorTipo = useCallback((tipo: FiltroTipo) => {
    setFiltroTipo(tipo);
    setPaginaActual(0);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  const crearContacto = useCallback(async (datos: DatosContacto): Promise<{ exito: boolean; error?: string; campo?: string }> => {
    try {
      await api.post<RespuestaCrearContacto>('/api/contactos', datos);
      await cargarContactos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'rut_duplicado') {
        return { exito: false, error: 'Este RUT ya está registrado', campo: 'rut' };
      }
      return { exito: false, error: apiError.error || 'Error al crear contacto' };
    }
  }, [cargarContactos]);

  const actualizarContacto = useCallback(async (id: string, datos: DatosContacto): Promise<{ exito: boolean; error?: string; campo?: string }> => {
    try {
      await api.put(`/api/contactos/${id}`, datos);
      await cargarContactos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'rut_duplicado') {
        return { exito: false, error: 'Este RUT ya está registrado', campo: 'rut' };
      }
      if (apiError.error === 'contacto_no_encontrado') {
        return { exito: false, error: 'El contacto ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al actualizar contacto' };
    }
  }, [cargarContactos]);

  const desactivarContacto = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/contactos/${id}/desactivar`);
      await cargarContactos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede desactivar contactos' };
      }
      if (apiError.error === 'contacto_no_encontrado') {
        return { exito: false, error: 'El contacto ya no existe' };
      }
      return { exito: false, error: apiError.error || 'Error al desactivar contacto' };
    }
  }, [cargarContactos]);

  const seleccionarParaEditar = useCallback((contacto: Contacto | null) => {
    setContactoEditando(contacto);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    contactos,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    busqueda,
    filtroTipo,
    contactoEditando,
    cargarContactos,
    buscar,
    filtrarPorTipo,
    cambiarPagina,
    crearContacto,
    actualizarContacto,
    desactivarContacto,
    seleccionarParaEditar,
    limpiarError,
  };
}
