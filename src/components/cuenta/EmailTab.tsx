'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Perfil, CambioEmail } from '@/types';

interface EmailTabProps {
  perfil: Perfil | null;
  onCambiarEmail: (datos: CambioEmail) => Promise<{ exito: boolean; error?: string }>;
}

export function EmailTab({ perfil, onCambiarEmail }: EmailTabProps) {
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [cambiando, setCambiando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const handleCambiar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!nuevoEmail.includes('@')) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un email válido' });
      return;
    }

    setCambiando(true);

    const resultado = await onCambiarEmail({ nuevoEmail });

    setCambiando(false);

    if (resultado.exito) {
      setMensaje({
        tipo: 'exito',
        texto: 'Se ha enviado un enlace de verificación a tu nuevo email',
      });
      setNuevoEmail('');
    } else {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al cambiar email' });
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">Email actual</h2>

        <div className="flex items-center gap-3">
          <span className="text-foreground">{perfil?.email || '...'}</span>
          {perfil?.emailVerificado ? (
            <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
              Verificado
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-full">
              Sin verificar
            </span>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">Cambiar email</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Se enviará un enlace de verificación al nuevo email antes de que el cambio sea efectivo.
        </p>

        <form onSubmit={handleCambiar} className="space-y-4">
          <Input
            type="email"
            etiqueta="Nuevo email"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            placeholder="nuevo@ejemplo.com"
            required
          />

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

          <Button type="submit" disabled={cambiando}>
            {cambiando ? 'Enviando...' : 'Enviar verificación'}
          </Button>
        </form>
      </section>
    </div>
  );
}
