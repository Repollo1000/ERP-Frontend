'use client';

import { useEffect } from 'react';
import type { Actividad } from '@/types';

interface ActividadTabProps {
  actividad: Actividad[];
  cargando: boolean;
  onCargar: () => Promise<void>;
}

const ACCIONES: Record<string, string> = {
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  CREAR: 'Creación',
  ACTUALIZAR: 'Actualización',
  ELIMINAR: 'Eliminación',
  DESACTIVAR: 'Desactivación',
  VER: 'Visualización',
  EXPORTAR: 'Exportación',
};

const ENTIDADES: Record<string, string> = {
  USUARIO: 'usuario',
  EMPRESA: 'empresa',
  PRODUCTO: 'producto',
  CONTACTO: 'contacto',
  VENTA: 'venta',
  COMPRA: 'compra',
  INVENTARIO: 'inventario',
};

export function ActividadTab({ actividad, cargando, onCargar }: ActividadTabProps) {
  useEffect(() => {
    onCargar();
  }, [onCargar]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const traducirAccion = (accion: string) => {
    return ACCIONES[accion] || accion;
  };

  const traducirEntidad = (entidad: string) => {
    return ENTIDADES[entidad] || entidad;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Historial de actividad</h2>
        <p className="text-sm text-foreground-muted">
          Registro de tus acciones recientes en el sistema
        </p>
      </div>

      {cargando && actividad.length === 0 ? (
        <div className="text-foreground-muted">Cargando actividad...</div>
      ) : actividad.length === 0 ? (
        <div className="text-foreground-muted">No hay actividad registrada</div>
      ) : (
        <div className="space-y-2">
          {actividad.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-border bg-background-secondary flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="text-sm text-foreground">
                  <span className="font-medium">{traducirAccion(item.accion)}</span>
                  {' de '}
                  <span>{traducirEntidad(item.entidad)}</span>
                  {item.entidadId && (
                    <span className="text-foreground-muted"> #{item.entidadId.slice(0, 8)}</span>
                  )}
                </div>
                {item.empresa && (
                  <div className="text-xs text-foreground-muted">
                    Empresa: {item.empresa}
                  </div>
                )}
              </div>
              <div className="text-xs text-foreground-muted whitespace-nowrap">
                {formatearFecha(item.ocurridoEn)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
