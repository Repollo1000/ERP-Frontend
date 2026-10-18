'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, getUsuario, setUsuario } from '@/lib/auth';
import { esCredencialesInvalidas, esCuentaBloqueada, esCodigoInvalido } from '@/lib/api';
import type { Usuario, CredencialesLogin, Empresa, ApiError, RespuestaLogin } from '@/types';

// Estado del flujo de login
export type EstadoLogin =
  | 'inicial'
  | 'requiere2FA'
  | 'requiereConfigurar2FA'
  | 'seleccionarEmpresa'
  | 'autenticado';

interface DatosConfigurar2FA {
  tokenTemporal: string;
  qrCode: string;
  secreto: string;
}

interface UseAuthReturn {
  // Estado
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
  estadoLogin: EstadoLogin;
  segundosBloqueado: number | null;

  // Datos para configurar 2FA
  datosConfigurar2FA: DatosConfigurar2FA | null;
  codigosRecuperacion: string[] | null;

  // Datos para seleccionar empresa
  empresasDisponibles: Empresa[];

  // Acciones
  login: (credenciales: CredencialesLogin) => Promise<void>;
  verificar2FA: (codigo: string) => Promise<void>;
  configurar2FA: (codigo: string) => Promise<void>;
  seleccionarEmpresa: (empresaId: string) => Promise<void>;
  logout: () => Promise<void>;
  limpiarError: () => void;
  limpiarCodigosRecuperacion: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();

  // Estado principal
  const [usuario, setUsuarioState] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoLogin, setEstadoLogin] = useState<EstadoLogin>('inicial');
  const [segundosBloqueado, setSegundosBloqueado] = useState<number | null>(null);

  // Token temporal para 2FA
  const [tokenTemporal, setTokenTemporal] = useState<string | null>(null);

  // Datos para configurar 2FA
  const [datosConfigurar2FA, setDatosConfigurar2FA] = useState<DatosConfigurar2FA | null>(null);
  const [codigosRecuperacion, setCodigosRecuperacion] = useState<string[] | null>(null);

  // Empresas disponibles para seleccionar
  const [empresasDisponibles, setEmpresasDisponibles] = useState<Empresa[]>([]);

  // Restaurar sesión al cargar
  useEffect(() => {
    const restaurar = async () => {
      try {
        const user = await authService.restaurarSesion();
        if (user) {
          setUsuarioState(user);
          if (user.empresaActiva) {
            setEstadoLogin('autenticado');
          } else if (user.empresas.length > 1) {
            setEmpresasDisponibles(user.empresas);
            setEstadoLogin('seleccionarEmpresa');
          } else if (user.empresas.length === 1) {
            // Seleccionar automáticamente la única empresa
            await authService.seleccionarEmpresa(user.empresas[0].id);
            setUsuarioState(getUsuario());
            setEstadoLogin('autenticado');
          }
        }
      } catch {
        // Sin sesión activa, está bien
      } finally {
        setCargando(false);
      }
    };

    restaurar();
  }, []);

  // Login
  const login = useCallback(async (credenciales: CredencialesLogin) => {
    setError(null);
    setSegundosBloqueado(null);
    setCargando(true);

    try {
      const respuesta = await authService.login(credenciales);

      setTokenTemporal(respuesta.tokenTemporal);

      if ('requiereConfigurar2FA' in respuesta && respuesta.requiereConfigurar2FA) {
        setDatosConfigurar2FA({
          tokenTemporal: respuesta.tokenTemporal,
          qrCode: respuesta.qrCode,
          secreto: respuesta.secreto,
        });
        setEstadoLogin('requiereConfigurar2FA');
      } else {
        setEstadoLogin('requiere2FA');
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (esCuentaBloqueada(err)) {
        setSegundosBloqueado(apiError.segundosRestantes || 900);
        setError('Cuenta bloqueada temporalmente');
      } else if (esCredencialesInvalidas(err)) {
        setError('Credenciales inválidas');
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  // Verificar 2FA
  const verificar2FA = useCallback(async (codigo: string) => {
    if (!tokenTemporal) {
      setError('Sesión expirada, vuelve a iniciar sesión');
      setEstadoLogin('inicial');
      return;
    }

    setError(null);
    setCargando(true);

    try {
      const respuesta = await authService.verificar2FA(tokenTemporal, codigo);
      setUsuarioState(getUsuario());
      setTokenTemporal(null);

      // Verificar si necesita seleccionar empresa
      if (respuesta.empresas.length > 1 && !respuesta.empresaActiva) {
        setEmpresasDisponibles(respuesta.empresas);
        setEstadoLogin('seleccionarEmpresa');
      } else {
        setEstadoLogin('autenticado');
        router.push('/');
      }
    } catch (err) {
      if (esCodigoInvalido(err)) {
        setError('Código inválido');
      } else if (esCuentaBloqueada(err)) {
        const apiError = err as ApiError;
        setSegundosBloqueado(apiError.segundosRestantes || 900);
        setError('Cuenta bloqueada temporalmente');
      } else {
        setError('Error al verificar código');
      }
    } finally {
      setCargando(false);
    }
  }, [tokenTemporal, router]);

  // Configurar 2FA
  const configurar2FA = useCallback(async (codigo: string) => {
    if (!datosConfigurar2FA) {
      setError('Datos de configuración no disponibles');
      setEstadoLogin('inicial');
      return;
    }

    setError(null);
    setCargando(true);

    try {
      const respuesta = await authService.configurar2FA(
        datosConfigurar2FA.tokenTemporal,
        codigo,
        datosConfigurar2FA.secreto
      );

      setUsuarioState(getUsuario());
      setDatosConfigurar2FA(null);

      // Guardar códigos de recuperación para mostrar
      if (respuesta.codigosRecuperacion) {
        setCodigosRecuperacion(respuesta.codigosRecuperacion);
      }

      // Verificar si necesita seleccionar empresa
      if (respuesta.empresas.length > 1 && !respuesta.empresaActiva) {
        setEmpresasDisponibles(respuesta.empresas);
        setEstadoLogin('seleccionarEmpresa');
      } else {
        setEstadoLogin('autenticado');
        // No redirigir aún si hay códigos de recuperación para mostrar
        if (!respuesta.codigosRecuperacion) {
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Error configurar2FA:', err);
      if (esCodigoInvalido(err)) {
        setError('Código inválido');
      } else {
        const apiError = err as ApiError;
        setError(apiError.error || 'Error al configurar 2FA');
      }
    } finally {
      setCargando(false);
    }
  }, [datosConfigurar2FA, router]);

  // Seleccionar empresa
  const seleccionarEmpresa = useCallback(async (empresaId: string) => {
    setError(null);
    setCargando(true);

    try {
      await authService.seleccionarEmpresa(empresaId);
      setUsuarioState(getUsuario());
      setEmpresasDisponibles([]);
      setEstadoLogin('autenticado');
      router.push('/');
    } catch {
      setError('Error al seleccionar empresa');
    } finally {
      setCargando(false);
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    setCargando(true);
    await authService.logout();
    setUsuarioState(null);
    setEstadoLogin('inicial');
    setTokenTemporal(null);
    setDatosConfigurar2FA(null);
    setCodigosRecuperacion(null);
    setEmpresasDisponibles([]);
    setCargando(false);
    router.push('/login');
  }, [router]);

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar códigos de recuperación (después de que el usuario los haya guardado)
  const limpiarCodigosRecuperacion = useCallback(() => {
    setCodigosRecuperacion(null);
    if (estadoLogin === 'autenticado') {
      router.push('/');
    }
  }, [estadoLogin, router]);

  return {
    usuario,
    cargando,
    error,
    estadoLogin,
    segundosBloqueado,
    datosConfigurar2FA,
    codigosRecuperacion,
    empresasDisponibles,
    login,
    verificar2FA,
    configurar2FA,
    seleccionarEmpresa,
    logout,
    limpiarError,
    limpiarCodigosRecuperacion,
  };
}
