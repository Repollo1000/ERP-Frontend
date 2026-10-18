'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { SesionActiva } from '@/types';

interface SesionesTabProps {
  sesiones: SesionActiva[];
  cargando: boolean;
  onCargar: () => Promise<void>;
  onCerrarSesion: (id: string) => Promise<{ exito: boolean; error?: string }>;
  onCerrarOtras: () => Promise<{ exito: boolean; cantidad?: number; error?: string }>;
}

export function SesionesTab({
  sesiones,
  cargando,
  onCargar,
  onCerrarSesion,
  onCerrarOtras,
}: SesionesTabProps) {
  const [cerrandoId, setCerrandoId] = useState<string | null>(null);
  const [cerrandoOtras, setCerrandoOtras] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    onCargar();
  }, [onCargar]);

  const handleCerrar = async (id: string) => {
    setCerrandoId(id);
    setMensaje(null);

    const resultado = await onCerrarSesion(id);

    setCerrandoId(null);

    if (!resultado.exito) {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al cerrar sesión' });
    }
  };

  const handleCerrarOtras = async () => {
    setCerrandoOtras(true);
    setMensaje(null);

    const resultado = await onCerrarOtras();

    setCerrandoOtras(false);

    if (resultado.exito) {
      setMensaje({
        tipo: 'exito',
        texto: `Se cerraron ${resultado.cantidad || 0} sesiones`,
      });
    } else {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al cerrar sesiones' });
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseUserAgent = (ua: string) => {
    // Simplificación básica del user agent
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Navegador';
  };

  const otrasSesiones = sesiones.filter((s) => !s.esActual);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">Sesiones activas</h2>
          <p className="text-sm text-foreground-muted">
            Dispositivos donde has iniciado sesión
          </p>
        </div>

        {otrasSesiones.length > 0 && (
          <Button
            variante="secondary"
            onClick={handleCerrarOtras}
            disabled={cerrandoOtras}
          >
            {cerrandoOtras ? 'Cerrando...' : 'Cerrar todas las demás'}
          </Button>
        )}
      </div>

      {mensaje && (
        <div
          className={`p-3 rounded-lg text-sm ${
            mensaje.tipo === 'exito'
              ? 'bg-success/10 text-success'
              : 'bg-error/10 text-error'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {cargando && sesiones.length === 0 ? (
        <div className="text-foreground-muted">Cargando sesiones...</div>
      ) : sesiones.length === 0 ? (
        <div className="text-foreground-muted">No hay sesiones activas</div>
      ) : (
        <div className="space-y-3">
          {sesiones.map((sesion) => (
            <div
              key={sesion.id}
              className={`p-4 rounded-lg border ${
                sesion.esActual
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background-secondary'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {parseUserAgent(sesion.userAgent)}
                    </span>
                    {sesion.esActual && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Sesión actual
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-foreground-muted">
                    IP: {sesion.ipOrigen}
                  </div>
                  <div className="text-sm text-foreground-muted">
                    Última actividad: {formatearFecha(sesion.usadoEn)}
                  </div>
                  <div className="text-xs text-foreground-muted">
                    Iniciada: {formatearFecha(sesion.creadoEn)}
                  </div>
                </div>

                {!sesion.esActual && (
                  <Button
                    variante="secondary"
                    tamaño="sm"
                    onClick={() => handleCerrar(sesion.id)}
                    disabled={cerrandoId === sesion.id}
                  >
                    {cerrandoId === sesion.id ? 'Cerrando...' : 'Cerrar'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
