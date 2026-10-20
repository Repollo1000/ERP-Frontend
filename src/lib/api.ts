import type { ApiError } from '@/types';

// ============================================
// Estado de autenticación en memoria
// ============================================

let accessToken: string | null = null;
let tokenExpiraEn: number | null = null;
let refrescando: Promise<boolean> | null = null;

export function setAccessToken(token: string | null, expiraEn?: number) {
  accessToken = token;
  tokenExpiraEn = expiraEn ? Date.now() + expiraEn * 1000 : null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function limpiarTokens() {
  accessToken = null;
  tokenExpiraEn = null;
}

function tokenExpirado(): boolean {
  if (!tokenExpiraEn) return false;
  // Considerar expirado 30 segundos antes para evitar race conditions
  return Date.now() > tokenExpiraEn - 30000;
}

// ============================================
// Cliente API
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    intentoRefresh = true
  ): Promise<T> {
    // Si el token está por expirar, refrescar primero
    if (accessToken && tokenExpirado() && intentoRefresh) {
      await this.intentarRefresh();
    }

    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token si existe
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Para cookies (refresh token)
    });

    // Manejar respuestas sin contenido
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json().catch(() => null);

    // Si es 401 y no estamos en /api/auth/refresh, intentar refresh
    if (response.status === 401 && intentoRefresh && !endpoint.includes('/auth/refresh')) {
      const refrescado = await this.intentarRefresh();
      if (refrescado) {
        // Reintentar la petición original
        return this.request<T>(endpoint, options, false);
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        error: data?.error || 'error_desconocido',
        segundosRestantes: data?.segundosRestantes,
      };
      throw error;
    }

    return data as T;
  }

  private async intentarRefresh(): Promise<boolean> {
    // Si ya hay un refresh en curso, esperar
    if (refrescando) {
      return refrescando;
    }

    refrescando = this.hacerRefresh();
    const resultado = await refrescando;
    refrescando = null;
    return resultado;
  }

  private async hacerRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // NO limpiar tokens aquí - el access token podría seguir siendo válido
        // Solo retornar false para indicar que el refresh falló
        return false;
      }

      const data = await response.json();
      setAccessToken(data.accessToken, data.expiraEn);
      return true;
    } catch {
      // NO limpiar tokens en error de red
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Petición sin token (para endpoints públicos o con token temporal)
  async postSinAuth<T>(endpoint: string, body?: unknown, tokenTemporal?: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (tokenTemporal) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${tokenTemporal}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error: ApiError = {
        error: data?.error || 'error_desconocido',
        segundosRestantes: data?.segundosRestantes,
      };
      throw error;
    }

    return data as T;
  }
}

// Instancia única del cliente
// Usar rutas relativas - Next.js proxy redirige /api/* al backend
export const api = new ApiClient('');

// ============================================
// Helpers para errores
// ============================================

export function esNoAutorizado(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    ((error as ApiError).error === 'token_expirado' ||
      (error as ApiError).error === 'token_invalido' ||
      (error as ApiError).error === 'no_autenticado' ||
      (error as ApiError).error === 'sesion_expirada')
  );
}

export function esCuentaBloqueada(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    (error as ApiError).error === 'cuenta_bloqueada'
  );
}

export function esCredencialesInvalidas(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    (error as ApiError).error === 'credenciales_invalidas'
  );
}

export function esCodigoInvalido(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    (error as ApiError).error === 'codigo_invalido'
  );
}
