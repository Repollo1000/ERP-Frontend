'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  Perfil,
  ActualizarPerfil,
  CambioContrasena,
  CambioEmail,
  SesionActiva,
  Actividad,
  ApiError,
} from '@/types';

interface UseCuentaReturn {
  // Estado
  perfil: Perfil | null;
  sesiones: SesionActiva[];
  actividad: Actividad[];
  cargando: boolean;
  error: string | null;

  // Perfil
  cargarPerfil: () => Promise<void>;
  actualizarPerfil: (datos: ActualizarPerfil) => Promise<{ exito: boolean; error?: string }>;

  // Contraseña
  cambiarContrasena: (datos: CambioContrasena) => Promise<{ exito: boolean; error?: string }>;

  // Email
  cambiarEmail: (datos: CambioEmail) => Promise<{ exito: boolean; error?: string }>;

  // 2FA
  regenerarCodigos2FA: (codigo: string) => Promise<{ exito: boolean; codigos?: string[]; error?: string }>;

  // Sesiones
  cargarSesiones: () => Promise<void>;
  cerrarSesion: (id: string) => Promise<{ exito: boolean; error?: string }>;
  cerrarOtrasSesiones: () => Promise<{ exito: boolean; cantidad?: number; error?: string }>;

  // Actividad
  cargarActividad: () => Promise<void>;

  // Exportar y desactivar
  exportarDatos: () => Promise<{ exito: boolean; datos?: unknown; error?: string }>;
  desactivarCuenta: (contrasena: string) => Promise<{ exito: boolean; error?: string }>;

  limpiarError: () => void;
}

export function useCuenta(): UseCuentaReturn {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perfil
  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resp = await api.get<Perfil>('/api/cuenta/perfil');
      setPerfil(resp);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar perfil');
    } finally {
      setCargando(false);
    }
  }, []);

  const actualizarPerfil = useCallback(async (datos: ActualizarPerfil): Promise<{ exito: boolean; error?: string }> => {
    try {
      const resp = await api.put<Perfil>('/api/cuenta/perfil', datos);
      setPerfil(resp);
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al actualizar perfil' };
    }
  }, []);

  // Contraseña
  const cambiarContrasena = useCallback(async (datos: CambioContrasena): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post('/api/cuenta/contrasena', datos);
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'contrasena_actual_incorrecta') {
        return { exito: false, error: 'La contraseña actual es incorrecta' };
      }
      if (apiError.error === 'contrasena_muy_corta') {
        return { exito: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }
      if (apiError.error === 'contrasena_comun') {
        return { exito: false, error: 'Esta contraseña es muy común, elige otra' };
      }
      return { exito: false, error: apiError.error || 'Error al cambiar contraseña' };
    }
  }, []);

  // Email
  const cambiarEmail = useCallback(async (datos: CambioEmail): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post('/api/cuenta/email', datos);
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'email_en_uso') {
        return { exito: false, error: 'Este email ya está en uso' };
      }
      return { exito: false, error: apiError.error || 'Error al cambiar email' };
    }
  }, []);

  // 2FA
  const regenerarCodigos2FA = useCallback(async (codigo: string): Promise<{ exito: boolean; codigos?: string[]; error?: string }> => {
    try {
      const resp = await api.post<{ codigosRecuperacion: string[] }>('/api/cuenta/2fa/regenerar', { codigo });
      return { exito: true, codigos: resp.codigosRecuperacion };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'codigo_invalido') {
        return { exito: false, error: 'Código inválido' };
      }
      if (apiError.error === '2fa_no_configurado') {
        return { exito: false, error: '2FA no está configurado' };
      }
      return { exito: false, error: apiError.error || 'Error al regenerar códigos' };
    }
  }, []);

  // Sesiones
  const cargarSesiones = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resp = await api.get<SesionActiva[]>('/api/cuenta/sesiones');
      setSesiones(resp);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar sesiones');
    } finally {
      setCargando(false);
    }
  }, []);

  const cerrarSesion = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.delete(`/api/cuenta/sesiones/${id}`);
      setSesiones(prev => prev.filter(s => s.id !== id));
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al cerrar sesión' };
    }
  }, []);

  const cerrarOtrasSesiones = useCallback(async (): Promise<{ exito: boolean; cantidad?: number; error?: string }> => {
    try {
      const resp = await api.delete<{ sesionesCerradas: number }>('/api/cuenta/sesiones');
      setSesiones(prev => prev.filter(s => s.esActual));
      return { exito: true, cantidad: resp.sesionesCerradas };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al cerrar sesiones' };
    }
  }, []);

  // Actividad
  const cargarActividad = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resp = await api.get<Actividad[]>('/api/cuenta/actividad');
      setActividad(resp);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar actividad');
    } finally {
      setCargando(false);
    }
  }, []);

  // Exportar
  const exportarDatos = useCallback(async (): Promise<{ exito: boolean; datos?: unknown; error?: string }> => {
    try {
      const resp = await api.get<unknown>('/api/cuenta/exportar');
      return { exito: true, datos: resp };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al exportar datos' };
    }
  }, []);

  // Desactivar
  const desactivarCuenta = useCallback(async (contrasena: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post('/api/cuenta/desactivar', { contrasena, confirmar: true });
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'contrasena_incorrecta') {
        return { exito: false, error: 'Contraseña incorrecta' };
      }
      return { exito: false, error: apiError.error || 'Error al desactivar cuenta' };
    }
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    perfil,
    sesiones,
    actividad,
    cargando,
    error,
    cargarPerfil,
    actualizarPerfil,
    cambiarContrasena,
    cambiarEmail,
    regenerarCodigos2FA,
    cargarSesiones,
    cerrarSesion,
    cerrarOtrasSesiones,
    cargarActividad,
    exportarDatos,
    desactivarCuenta,
    limpiarError,
  };
}

// Hook separado para recuperación de contraseña (público)
export function useRecuperarContrasena() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solicitarRecuperacion = useCallback(async (email: string): Promise<{ exito: boolean; error?: string }> => {
    setCargando(true);
    setError(null);
    try {
      await api.post('/api/cuenta/contrasena/recuperar', { email });
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      return { exito: false, error: apiError.error || 'Error al solicitar recuperación' };
    } finally {
      setCargando(false);
    }
  }, []);

  const restablecerContrasena = useCallback(async (token: string, nuevaContrasena: string): Promise<{ exito: boolean; error?: string }> => {
    setCargando(true);
    setError(null);
    try {
      await api.post('/api/cuenta/contrasena/restablecer', { token, nuevaContrasena });
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'token_invalido') {
        return { exito: false, error: 'El enlace ha expirado o es inválido' };
      }
      if (apiError.error === 'contrasena_muy_corta') {
        return { exito: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }
      if (apiError.error === 'contrasena_comun') {
        return { exito: false, error: 'Esta contraseña es muy común, elige otra' };
      }
      return { exito: false, error: apiError.error || 'Error al restablecer contraseña' };
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    cargando,
    error,
    solicitarRecuperacion,
    restablecerContrasena,
  };
}
