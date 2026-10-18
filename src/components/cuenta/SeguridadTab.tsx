'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CambioContrasena } from '@/types';

interface SeguridadTabProps {
  onCambiarContrasena: (datos: CambioContrasena) => Promise<{ exito: boolean; error?: string }>;
  onRegenerarCodigos: (codigo: string) => Promise<{ exito: boolean; codigos?: string[]; error?: string }>;
  onDesactivarCuenta: (contrasena: string) => Promise<{ exito: boolean; error?: string }>;
}

export function SeguridadTab({
  onCambiarContrasena,
  onRegenerarCodigos,
  onDesactivarCuenta,
}: SeguridadTabProps) {
  // Estado para cambio de contraseña
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState('');
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false);
  const [mensajeContrasena, setMensajeContrasena] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Estado para regenerar códigos 2FA
  const [codigo2FA, setCodigo2FA] = useState('');
  const [regenerando, setRegenerando] = useState(false);
  const [codigosNuevos, setCodigosNuevos] = useState<string[] | null>(null);
  const [mensaje2FA, setMensaje2FA] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Estado para desactivar cuenta
  const [mostrarDesactivar, setMostrarDesactivar] = useState(false);
  const [contrasenaDesactivar, setContrasenaDesactivar] = useState('');
  const [desactivando, setDesactivando] = useState(false);
  const [mensajeDesactivar, setMensajeDesactivar] = useState<{ tipo: 'error'; texto: string } | null>(null);

  const handleCambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeContrasena(null);

    if (contrasenaNueva !== contrasenaConfirmar) {
      setMensajeContrasena({ tipo: 'error', texto: 'Las contraseñas no coinciden' });
      return;
    }

    if (contrasenaNueva.length < 8) {
      setMensajeContrasena({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    setCambiandoContrasena(true);

    const resultado = await onCambiarContrasena({
      contrasenaActual,
      contrasenaNueva,
    });

    setCambiandoContrasena(false);

    if (resultado.exito) {
      setMensajeContrasena({ tipo: 'exito', texto: 'Contraseña cambiada correctamente' });
      setContrasenaActual('');
      setContrasenaNueva('');
      setContrasenaConfirmar('');
    } else {
      setMensajeContrasena({ tipo: 'error', texto: resultado.error || 'Error al cambiar contraseña' });
    }
  };

  const handleRegenerarCodigos = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje2FA(null);
    setCodigosNuevos(null);
    setRegenerando(true);

    const resultado = await onRegenerarCodigos(codigo2FA);

    setRegenerando(false);

    if (resultado.exito && resultado.codigos) {
      setCodigosNuevos(resultado.codigos);
      setCodigo2FA('');
    } else {
      setMensaje2FA({ tipo: 'error', texto: resultado.error || 'Error al regenerar códigos' });
    }
  };

  const handleDesactivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeDesactivar(null);
    setDesactivando(true);

    const resultado = await onDesactivarCuenta(contrasenaDesactivar);

    setDesactivando(false);

    if (resultado.exito) {
      // La cuenta fue desactivada, redirigir al login
      window.location.href = '/login';
    } else {
      setMensajeDesactivar({ tipo: 'error', texto: resultado.error || 'Error al desactivar cuenta' });
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* Cambio de contraseña */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">Cambiar contraseña</h2>

        <form onSubmit={handleCambiarContrasena} className="space-y-4">
          <Input
            type="password"
            etiqueta="Contraseña actual"
            value={contrasenaActual}
            onChange={(e) => setContrasenaActual(e.target.value)}
            required
          />

          <Input
            type="password"
            etiqueta="Nueva contraseña"
            value={contrasenaNueva}
            onChange={(e) => setContrasenaNueva(e.target.value)}
            required
          />

          <Input
            type="password"
            etiqueta="Confirmar nueva contraseña"
            value={contrasenaConfirmar}
            onChange={(e) => setContrasenaConfirmar(e.target.value)}
            required
          />

          {mensajeContrasena && (
            <div
              className={`p-3 rounded-lg text-sm ${
                mensajeContrasena.tipo === 'exito'
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              }`}
            >
              {mensajeContrasena.texto}
            </div>
          )}

          <Button type="submit" disabled={cambiandoContrasena}>
            {cambiandoContrasena ? 'Cambiando...' : 'Cambiar contraseña'}
          </Button>
        </form>
      </section>

      {/* Códigos de recuperación 2FA */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">Códigos de recuperación 2FA</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Regenera tus códigos de recuperación si los perdiste o usaste todos.
          Los códigos anteriores dejarán de funcionar.
        </p>

        {codigosNuevos ? (
          <div className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning rounded-lg">
              <p className="text-sm text-warning font-medium mb-2">
                Guarda estos códigos en un lugar seguro. No podrás verlos de nuevo.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {codigosNuevos.map((codigo, i) => (
                  <code key={i} className="text-sm bg-background p-2 rounded text-center">
                    {codigo}
                  </code>
                ))}
              </div>
            </div>
            <Button variante="secondary" onClick={() => setCodigosNuevos(null)}>
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRegenerarCodigos} className="space-y-4">
            <Input
              etiqueta="Código 2FA actual"
              value={codigo2FA}
              onChange={(e) => setCodigo2FA(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />

            {mensaje2FA && (
              <div className="p-3 rounded-lg text-sm bg-error/10 text-error">
                {mensaje2FA.texto}
              </div>
            )}

            <Button type="submit" variante="secondary" disabled={regenerando}>
              {regenerando ? 'Regenerando...' : 'Regenerar códigos'}
            </Button>
          </form>
        )}
      </section>

      {/* Desactivar cuenta */}
      <section>
        <h2 className="text-lg font-medium text-error mb-4">Zona de peligro</h2>

        {!mostrarDesactivar ? (
          <Button variante="danger" onClick={() => setMostrarDesactivar(true)}>
            Desactivar mi cuenta
          </Button>
        ) : (
          <div className="p-4 border border-error rounded-lg space-y-4">
            <p className="text-sm text-foreground-muted">
              Esta acción desactivará tu cuenta. Podrás solicitar reactivarla contactando al soporte.
            </p>

            <form onSubmit={handleDesactivar} className="space-y-4">
              <Input
                type="password"
                etiqueta="Confirma tu contraseña"
                value={contrasenaDesactivar}
                onChange={(e) => setContrasenaDesactivar(e.target.value)}
                required
              />

              {mensajeDesactivar && (
                <div className="p-3 rounded-lg text-sm bg-error/10 text-error">
                  {mensajeDesactivar.texto}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variante="secondary"
                  onClick={() => {
                    setMostrarDesactivar(false);
                    setContrasenaDesactivar('');
                    setMensajeDesactivar(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variante="danger" disabled={desactivando}>
                  {desactivando ? 'Desactivando...' : 'Confirmar desactivación'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
