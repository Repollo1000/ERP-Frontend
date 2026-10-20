'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type {
  Vista,
  CrearVista,
  RespuestaVistas,
  ModuloVista,
  ConfiguracionVista,
  ApiError,
} from '@/types';

interface UseVistasReturn {
  // Estado
  vistas: Vista[];
  vistasPersonales: Vista[];
  vistasCompartidas: Vista[];
  vistaActual: Vista | null;
  vistaPredeterminada: Vista | null;
  cargando: boolean;
  error: string | null;

  // Acciones
  cargarVistas: (modulo: ModuloVista) => Promise<void>;
  cargarVistaPredeterminada: (modulo: ModuloVista) => Promise<Vista | null>;
  crearVista: (datos: CrearVista) => Promise<{ exito: boolean; vista?: Vista; error?: string }>;
  crearVistaCompartida: (datos: CrearVista) => Promise<{ exito: boolean; vista?: Vista; error?: string }>;
  actualizarVista: (id: string, datos: Partial<CrearVista>) => Promise<{ exito: boolean; error?: string }>;
  eliminarVista: (id: string) => Promise<{ exito: boolean; error?: string }>;
  marcarPredeterminada: (id: string) => Promise<{ exito: boolean; error?: string }>;
  quitarPredeterminada: (id: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarVista: (vista: Vista | null) => void;
  aplicarVista: (vista: Vista) => ConfiguracionVista;
  limpiarError: () => void;
}

export function useVistas(): UseVistasReturn {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [vistasPersonales, setVistasPersonales] = useState<Vista[]>([]);
  const [vistasCompartidas, setVistasCompartidas] = useState<Vista[]>([]);
  const [vistaActual, setVistaActual] = useState<Vista | null>(null);
  const [vistaPredeterminada, setVistaPredeterminada] = useState<Vista | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduloActual, setModuloActual] = useState<ModuloVista | null>(null);

  // Todas las vistas combinadas
  const vistas = [...vistasPersonales, ...vistasCompartidas];

  const cargarVistas = useCallback(async (modulo: ModuloVista) => {
    if (!usuario?.empresaActiva) return;

    setCargando(true);
    setError(null);
    setModuloActual(modulo);

    try {
      const respuesta = await api.get<RespuestaVistas>(
        `/api/vistas?modulo=${modulo}`
      );

      setVistasPersonales(respuesta.personales);
      setVistasCompartidas(respuesta.compartidas);

      // Buscar si alguna está marcada como predeterminada
      const predeterminada = [...respuesta.personales, ...respuesta.compartidas]
        .find(v => v.predeterminada);
      setVistaPredeterminada(predeterminada || null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar vistas');
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  const cargarVistaPredeterminada = useCallback(async (modulo: ModuloVista): Promise<Vista | null> => {
    if (!usuario?.empresaActiva) return null;

    try {
      const vista = await api.get<Vista>(
        `/api/vistas/predeterminada?modulo=${modulo}`
      );
      setVistaPredeterminada(vista);
      return vista;
    } catch {
      // No hay vista predeterminada, es normal
      setVistaPredeterminada(null);
      return null;
    }
  }, [usuario]);

  const crearVista = useCallback(async (datos: CrearVista): Promise<{ exito: boolean; vista?: Vista; error?: string }> => {
    try {
      const vista = await api.post<Vista>('/api/vistas', datos);

      // Agregar a la lista de personales
      setVistasPersonales(prev => [...prev, vista]);

      return { exito: true, vista };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'nombre_duplicado') {
        return { exito: false, error: 'Ya existe una vista con ese nombre' };
      }
      return { exito: false, error: apiError.error || 'Error al crear vista' };
    }
  }, []);

  const crearVistaCompartida = useCallback(async (datos: CrearVista): Promise<{ exito: boolean; vista?: Vista; error?: string }> => {
    try {
      const vista = await api.post<Vista>('/api/vistas/compartidas', datos);

      // Agregar a la lista de compartidas
      setVistasCompartidas(prev => [...prev, vista]);

      return { exito: true, vista };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede crear vistas compartidas' };
      }
      if (apiError.error === 'nombre_duplicado') {
        return { exito: false, error: 'Ya existe una vista compartida con ese nombre' };
      }
      return { exito: false, error: apiError.error || 'Error al crear vista compartida' };
    }
  }, []);

  const actualizarVista = useCallback(async (id: string, datos: Partial<CrearVista>): Promise<{ exito: boolean; error?: string }> => {
    try {
      const vistaActualizada = await api.put<Vista>(`/api/vistas/${id}`, datos);

      // Actualizar en la lista correspondiente
      setVistasPersonales(prev =>
        prev.map(v => v.id === id ? vistaActualizada : v)
      );
      setVistasCompartidas(prev =>
        prev.map(v => v.id === id ? vistaActualizada : v)
      );

      // Actualizar vista actual si es la misma
      if (vistaActual?.id === id) {
        setVistaActual(vistaActualizada);
      }

      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'vista_no_encontrada') {
        return { exito: false, error: 'La vista ya no existe' };
      }
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'No tienes permiso para editar esta vista' };
      }
      return { exito: false, error: apiError.error || 'Error al actualizar vista' };
    }
  }, [vistaActual]);

  const eliminarVista = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.delete(`/api/vistas/${id}`);

      // Eliminar de las listas
      setVistasPersonales(prev => prev.filter(v => v.id !== id));
      setVistasCompartidas(prev => prev.filter(v => v.id !== id));

      // Limpiar vista actual si es la eliminada
      if (vistaActual?.id === id) {
        setVistaActual(null);
      }
      if (vistaPredeterminada?.id === id) {
        setVistaPredeterminada(null);
      }

      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'vista_no_encontrada') {
        return { exito: false, error: 'La vista ya no existe' };
      }
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'No tienes permiso para eliminar esta vista' };
      }
      return { exito: false, error: apiError.error || 'Error al eliminar vista' };
    }
  }, [vistaActual, vistaPredeterminada]);

  const marcarPredeterminada = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/vistas/${id}/predeterminada`);

      // Actualizar estado local
      const vista = vistas.find(v => v.id === id);
      if (vista) {
        setVistaPredeterminada({ ...vista, predeterminada: true });

        // Actualizar en las listas
        setVistasPersonales(prev =>
          prev.map(v => ({ ...v, predeterminada: v.id === id }))
        );
        setVistasCompartidas(prev =>
          prev.map(v => ({ ...v, predeterminada: v.id === id }))
        );
      }

      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al marcar como predeterminada' };
    }
  }, [vistas]);

  const quitarPredeterminada = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.delete(`/api/vistas/${id}/predeterminada`);

      // Actualizar estado local
      setVistaPredeterminada(null);

      // Actualizar en las listas
      setVistasPersonales(prev =>
        prev.map(v => ({ ...v, predeterminada: false }))
      );
      setVistasCompartidas(prev =>
        prev.map(v => ({ ...v, predeterminada: false }))
      );

      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al quitar predeterminada' };
    }
  }, []);

  const seleccionarVista = useCallback((vista: Vista | null) => {
    setVistaActual(vista);
  }, []);

  const aplicarVista = useCallback((vista: Vista): ConfiguracionVista => {
    return vista.configuracion;
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Recargar vistas cuando cambie el módulo
  useEffect(() => {
    if (moduloActual && !cargandoAuth && usuario?.empresaActiva) {
      cargarVistas(moduloActual);
    }
  }, [moduloActual, cargandoAuth, usuario, cargarVistas]);

  return {
    vistas,
    vistasPersonales,
    vistasCompartidas,
    vistaActual,
    vistaPredeterminada,
    cargando,
    error,
    cargarVistas,
    cargarVistaPredeterminada,
    crearVista,
    crearVistaCompartida,
    actualizarVista,
    eliminarVista,
    marcarPredeterminada,
    quitarPredeterminada,
    seleccionarVista,
    aplicarVista,
    limpiarError,
  };
}
