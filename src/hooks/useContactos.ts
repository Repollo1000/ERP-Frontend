'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import type {
  Contacto,
  DatosContacto,
  ApiError,
  RespuestaPaginada,
  FiltrosContactos,
  DireccionOrden,
  RespuestaAccionMasiva,
  SolicitudAccionMasiva,
} from '@/types';

interface RespuestaCrearContacto {
  id: string;
}

type FiltroTipoLegacy = 'todos' | 'clientes' | 'proveedores';

interface UseContactosReturn {
  // Estado
  contactos: Contacto[];
  cargando: boolean;
  error: string | null;

  // Paginación (con metadata real del backend)
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;

  // Filtros y ordenamiento
  filtros: FiltrosContactos;
  ordenPor: string;
  ordenDir: DireccionOrden;

  // Legacy: mantener compatibilidad
  busqueda: string;
  filtroTipo: FiltroTipoLegacy;

  // Selección múltiple
  seleccionados: Contacto[];

  // Contacto seleccionado para editar
  contactoEditando: Contacto | null;

  // Acciones
  cargarContactos: () => Promise<void>;
  cambiarFiltros: (nuevosFiltros: Partial<FiltrosContactos>) => void;
  cambiarOrden: (campo: string, direccion: DireccionOrden) => void;
  cambiarPagina: (pagina: number) => void;
  cambiarPorPagina: (cantidad: number) => void;
  crearContacto: (datos: DatosContacto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  actualizarContacto: (id: string, datos: DatosContacto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  desactivarContacto: (id: string) => Promise<{ exito: boolean; error?: string }>;
  reactivarContacto: (id: string) => Promise<{ exito: boolean; error?: string }>;
  seleccionarParaEditar: (contacto: Contacto | null) => void;
  limpiarError: () => void;

  // Legacy: mantener compatibilidad
  buscar: (texto: string) => void;
  filtrarPorTipo: (tipo: FiltroTipoLegacy) => void;

  // Selección múltiple
  seleccionar: (contactos: Contacto[]) => void;
  limpiarSeleccion: () => void;

  // Acciones masivas
  desactivarMasivo: (ids: string[]) => Promise<RespuestaAccionMasiva>;
  reactivarMasivo: (ids: string[]) => Promise<RespuestaAccionMasiva>;
}

const FILTROS_INICIALES: FiltrosContactos = {
  pagina: 0,
  porPagina: 20,
  ordenPor: 'nombre',
  ordenDir: 'asc',
};

export function useContactos(): UseContactosReturn {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [porPagina, setPorPagina] = useState(20);

  // Filtros y ordenamiento
  const [filtros, setFiltros] = useState<FiltrosContactos>(FILTROS_INICIALES);
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [ordenDir, setOrdenDir] = useState<DireccionOrden>('asc');

  // Selección
  const [seleccionados, setSeleccionados] = useState<Contacto[]>([]);
  const [contactoEditando, setContactoEditando] = useState<Contacto | null>(null);

  const inicializadoRef = useRef(false);

  const cargarContactos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Paginación
      params.set('pagina', paginaActual.toString());
      params.set('porPagina', porPagina.toString());

      // Ordenamiento
      params.set('ordenPor', ordenPor);
      params.set('ordenDir', ordenDir);

      // Filtros
      if (filtros.q) params.set('q', filtros.q);
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      if (filtros.estado) params.set('estado', filtros.estado);
      if (filtros.tipoPersona) params.set('tipoPersona', filtros.tipoPersona);

      const respuesta = await api.get<RespuestaPaginada<Contacto>>(
        `/api/contactos?${params.toString()}`
      );

      // Parsear respuesta paginada con metadata real
      setContactos(respuesta.contenido);
      setTotalPaginas(respuesta.totalPaginas);
      setTotalElementos(respuesta.totalElementos);
      setPorPagina(respuesta.porPagina);
      setPaginaActual(respuesta.pagina);

      // Limpiar selección al cambiar datos
      setSeleccionados([]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar contactos');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, porPagina, ordenPor, ordenDir, filtros]);

  useEffect(() => {
    if (cargandoAuth) return;

    if (usuario?.empresaActiva) {
      if (!inicializadoRef.current) {
        inicializadoRef.current = true;
      }
      cargarContactos();
    }
  }, [usuario, cargandoAuth, cargarContactos]);

  const cambiarFiltros = useCallback((nuevosFiltros: Partial<FiltrosContactos>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setPaginaActual(0);
  }, []);

  const cambiarOrden = useCallback((campo: string, direccion: DireccionOrden) => {
    setOrdenPor(campo);
    setOrdenDir(direccion);
    setPaginaActual(0);
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina);
  }, []);

  const cambiarPorPagina = useCallback((cantidad: number) => {
    setPorPagina(cantidad);
    setPaginaActual(0);
  }, []);

  // Legacy: mantener compatibilidad con código existente
  const buscar = useCallback((texto: string) => {
    setFiltros(prev => ({ ...prev, q: texto || undefined }));
    setPaginaActual(0);
  }, []);

  const filtrarPorTipo = useCallback((tipo: FiltroTipoLegacy) => {
    const tipoApi = tipo === 'clientes' ? 'cliente' : tipo === 'proveedores' ? 'proveedor' : undefined;
    setFiltros(prev => ({ ...prev, tipo: tipoApi }));
    setPaginaActual(0);
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

  const reactivarContacto = useCallback(async (id: string): Promise<{ exito: boolean; error?: string }> => {
    try {
      await api.post(`/api/contactos/${id}/reactivar`);
      await cargarContactos();
      return { exito: true };
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'acceso_denegado') {
        return { exito: false, error: 'Solo un administrador puede reactivar contactos' };
      }
      if (apiError.error === 'contacto_no_encontrado') {
        return { exito: false, error: 'El contacto ya no existe' };
      }
      if (apiError.error === 'contacto_bloqueado') {
        return { exito: false, error: 'No se puede reactivar un contacto bloqueado o anonimizado' };
      }
      return { exito: false, error: apiError.error || 'Error al reactivar contacto' };
    }
  }, [cargarContactos]);

  // Acciones masivas
  const desactivarMasivo = useCallback(async (ids: string[]): Promise<RespuestaAccionMasiva> => {
    try {
      const respuesta = await api.post<RespuestaAccionMasiva>(
        '/api/contactos/masivo/desactivar',
        { ids } as SolicitudAccionMasiva
      );
      await cargarContactos();
      setSeleccionados([]);
      return respuesta;
    } catch (err) {
      const apiError = err as ApiError;
      return {
        exitosos: 0,
        fallidos: ids.length,
        errores: [apiError.error || 'Error al desactivar contactos'],
      };
    }
  }, [cargarContactos]);

  const reactivarMasivo = useCallback(async (ids: string[]): Promise<RespuestaAccionMasiva> => {
    try {
      const respuesta = await api.post<RespuestaAccionMasiva>(
        '/api/contactos/masivo/reactivar',
        { ids } as SolicitudAccionMasiva
      );
      await cargarContactos();
      setSeleccionados([]);
      return respuesta;
    } catch (err) {
      const apiError = err as ApiError;
      return {
        exitosos: 0,
        fallidos: ids.length,
        errores: [apiError.error || 'Error al reactivar contactos'],
      };
    }
  }, [cargarContactos]);

  const seleccionarParaEditar = useCallback((contacto: Contacto | null) => {
    setContactoEditando(contacto);
  }, []);

  const seleccionar = useCallback((contactos: Contacto[]) => {
    setSeleccionados(contactos);
  }, []);

  const limpiarSeleccion = useCallback(() => {
    setSeleccionados([]);
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Valores legacy derivados de filtros
  const busqueda = filtros.q || '';
  const filtroTipo: FiltroTipoLegacy = filtros.tipo === 'cliente' ? 'clientes' : filtros.tipo === 'proveedor' ? 'proveedores' : 'todos';

  return {
    contactos,
    cargando,
    error,
    paginaActual,
    totalPaginas,
    totalElementos,
    porPagina,
    filtros,
    ordenPor,
    ordenDir,
    busqueda,
    filtroTipo,
    seleccionados,
    contactoEditando,
    cargarContactos,
    cambiarFiltros,
    cambiarOrden,
    cambiarPagina,
    cambiarPorPagina,
    crearContacto,
    actualizarContacto,
    desactivarContacto,
    reactivarContacto,
    seleccionarParaEditar,
    limpiarError,
    buscar,
    filtrarPorTipo,
    seleccionar,
    limpiarSeleccion,
    desactivarMasivo,
    reactivarMasivo,
  };
}
