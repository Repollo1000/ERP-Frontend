import { api, setAccessToken, getAccessToken, limpiarTokens } from './api';
import type {
  CredencialesLogin,
  RespuestaLogin,
  RespuestaAuth,
  RespuestaEmpresa,
  RespuestaRefresh,
  RespuestaMe,
  Usuario,
  Empresa,
} from '@/types';

// ============================================
// Estado de usuario en memoria
// ============================================

let usuarioActual: Usuario | null = null;

export function getUsuario(): Usuario | null {
  return usuarioActual;
}

export function setUsuario(usuario: Usuario | null) {
  usuarioActual = usuario;
}

// ============================================
// Servicios de autenticación
// ============================================

export const authService = {
  /**
   * Paso 1: Login con email y contraseña.
   * Devuelve token temporal para 2FA o datos para configurar 2FA.
   */
  async login(credenciales: CredencialesLogin): Promise<RespuestaLogin> {
    return api.postSinAuth<RespuestaLogin>('/api/auth/login', credenciales);
  },

  /**
   * Paso 2a: Verificar código 2FA.
   * Devuelve access token y lista de empresas.
   */
  async verificar2FA(tokenTemporal: string, codigo: string): Promise<RespuestaAuth> {
    const respuesta = await api.postSinAuth<RespuestaAuth>(
      '/api/auth/2fa',
      { codigo },
      tokenTemporal
    );

    // Guardar token
    setAccessToken(respuesta.accessToken, respuesta.expiraEn);

    // Construir usuario
    const empresaActiva = respuesta.empresaActiva
      ? respuesta.empresas.find(e => e.id === respuesta.empresaActiva) || null
      : respuesta.empresas.length === 1
        ? respuesta.empresas[0]
        : null;

    setUsuario({
      id: respuesta.usuario.id,
      empresas: respuesta.empresas,
      empresaActiva,
    });

    return respuesta;
  },

  /**
   * Paso 2b: Configurar 2FA por primera vez.
   * Devuelve access token y códigos de recuperación.
   */
  async configurar2FA(
    tokenTemporal: string,
    codigo: string,
    secreto: string
  ): Promise<RespuestaAuth> {
    const respuesta = await api.postSinAuth<RespuestaAuth>(
      '/api/auth/2fa/configurar',
      { codigo, secreto },
      tokenTemporal
    );

    // Guardar token
    setAccessToken(respuesta.accessToken, respuesta.expiraEn);

    // Construir usuario
    const empresaActiva = respuesta.empresaActiva
      ? respuesta.empresas.find(e => e.id === respuesta.empresaActiva) || null
      : respuesta.empresas.length === 1
        ? respuesta.empresas[0]
        : null;

    setUsuario({
      id: respuesta.usuario.id,
      empresas: respuesta.empresas,
      empresaActiva,
    });

    return respuesta;
  },

  /**
   * Seleccionar empresa activa.
   * Actualiza el access token con la empresa seleccionada.
   */
  async seleccionarEmpresa(empresaId: string): Promise<RespuestaEmpresa> {
    const respuesta = await api.post<RespuestaEmpresa>('/api/auth/empresa', { empresaId });

    // Actualizar token
    setAccessToken(respuesta.accessToken, respuesta.expiraEn);

    // Actualizar usuario
    if (usuarioActual) {
      setUsuario({
        ...usuarioActual,
        empresaActiva: respuesta.empresa,
      });
    }

    return respuesta;
  },

  /**
   * Refrescar access token.
   * Se llama automáticamente por el API client.
   */
  async refresh(): Promise<RespuestaRefresh | null> {
    try {
      const respuesta = await api.postSinAuth<RespuestaRefresh>('/api/auth/refresh');

      setAccessToken(respuesta.accessToken, respuesta.expiraEn);

      const empresaActiva = respuesta.empresaActiva
        ? respuesta.empresas.find(e => e.id === respuesta.empresaActiva) || null
        : null;

      setUsuario({
        id: respuesta.usuario.id,
        empresas: respuesta.empresas,
        empresaActiva,
      });

      return respuesta;
    } catch {
      // NO limpiar tokens aquí - el access token podría seguir siendo válido
      // Solo retornar null para indicar que el refresh falló
      return null;
    }
  },

  /**
   * Cerrar sesión.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } finally {
      limpiarTokens();
      setUsuario(null);
    }
  },

  /**
   * Obtener datos del usuario actual.
   */
  async obtenerUsuario(): Promise<Usuario | null> {
    try {
      const respuesta = await api.get<RespuestaMe>('/api/auth/me');

      const usuario: Usuario = {
        id: respuesta.id,
        empresas: respuesta.empresas,
        empresaActiva: usuarioActual?.empresaActiva || null,
      };

      setUsuario(usuario);
      return usuario;
    } catch {
      return null;
    }
  },

  /**
   * Intentar restaurar sesión al cargar la página.
   * Si ya hay token/usuario en memoria, usarlos.
   * Si no, intentar refresh con la cookie.
   */
  async restaurarSesion(): Promise<Usuario | null> {
    // Si ya hay un access token en memoria, no intentar refresh
    // (el token fue establecido por login/2FA recientemente)
    if (getAccessToken()) {
      return usuarioActual;
    }

    // Sin token en memoria, intentar refresh con cookie
    try {
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 5000);
      });

      const respuesta = await Promise.race([
        this.refresh(),
        timeoutPromise,
      ]);

      if (!respuesta) {
        return null;
      }

      const empresaActiva = respuesta.empresaActiva
        ? respuesta.empresas.find(e => e.id === respuesta.empresaActiva) || null
        : respuesta.empresas.length === 1
          ? respuesta.empresas[0]
          : null;

      const usuario: Usuario = {
        id: respuesta.usuario.id,
        empresas: respuesta.empresas,
        empresaActiva,
      };

      setUsuario(usuario);
      return usuario;
    } catch {
      return null;
    }
  },

  estaAutenticado(): boolean {
    return usuarioActual !== null;
  },

  tieneEmpresa(): boolean {
    return usuarioActual?.empresaActiva !== null;
  },

  esAdministrador(): boolean {
    return usuarioActual?.empresaActiva?.rol === 'ADMINISTRADOR';
  },

  tieneMultiplesEmpresas(): boolean {
    return (usuarioActual?.empresas.length ?? 0) > 1;
  },
};
