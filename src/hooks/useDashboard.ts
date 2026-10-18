'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import type { ApiError } from '@/types';

interface MetricasVentas {
  totalHoy: number;
  totalSemana: number;
  totalMes: number;
  cantidadHoy: number;
  cantidadMes: number;
}

interface MetricasCompras {
  totalMes: number;
  cantidadMes: number;
}

interface ProductoAlerta {
  id: string;
  codigo: string | null;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

interface MetricasInventario {
  productosActivos: number;
  productosBajoMinimo: number;
  productosSinStock: number;
  alertas: ProductoAlerta[];
}

interface VentaDiaria {
  fecha: string;
  total: number;
}

interface TopCliente {
  id: string;
  nombre: string;
  totalCompras: number;
  cantidadCompras: number;
}

export interface ResumenDashboard {
  ventas: MetricasVentas;
  compras: MetricasCompras;
  inventario: MetricasInventario;
  ventasUltimaSemana: VentaDiaria[];
  topClientes: TopCliente[];
}

interface UseDashboardReturn {
  resumen: ResumenDashboard | null;
  cargando: boolean;
  error: string | null;
  cargarResumen: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarResumen = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await api.get<ResumenDashboard>('/api/dashboard');
      setResumen(respuesta);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Error al cargar dashboard');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  return {
    resumen,
    cargando,
    error,
    cargarResumen,
  };
}
