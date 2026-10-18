'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRecuperarContrasena } from '@/hooks/useCuenta';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const { cargando, solicitarRecuperacion } = useRecuperarContrasena();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const resultado = await solicitarRecuperacion(email);

    if (resultado.exito) {
      setEnviado(true);
    } else {
      setError(resultado.error || 'Error al enviar solicitud');
    }
  };

  if (enviado) {
    return (
      <div className="bg-background p-8 rounded-lg border border-border shadow-sm">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Revisa tu correo
          </h1>
          <p className="text-foreground-muted text-sm">
            Si existe una cuenta con el email <strong>{email}</strong>,
            recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-foreground-muted text-sm">
            El enlace expira en 1 hora.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-primary hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-8 rounded-lg border border-border shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Recuperar contraseña
        </h1>
        <p className="text-foreground-muted text-sm mt-2">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          etiqueta="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          autoFocus
        />

        {error && (
          <div className="p-3 rounded-lg text-sm bg-error/10 text-error">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-foreground-muted hover:text-foreground"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
