'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRecuperarContrasena } from '@/hooks/useCuenta';

function RestablecerForm() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [exito, setExito] = useState(false);
  const { cargando, restablecerContrasena } = useRecuperarContrasena();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const resultado = await restablecerContrasena(token, contrasena);

    if (resultado.exito) {
      setExito(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setError(resultado.error || 'Error al restablecer contraseña');
    }
  };

  if (exito) {
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
            Contraseña restablecida
          </h1>
          <p className="text-foreground-muted text-sm">
            Tu contraseña ha sido cambiada exitosamente.
            Serás redirigido al inicio de sesión...
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-primary hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-8 rounded-lg border border-border shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Nueva contraseña
        </h1>
        <p className="text-foreground-muted text-sm mt-2">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          etiqueta="Nueva contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          autoFocus
        />

        <Input
          type="password"
          etiqueta="Confirmar contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repite la contraseña"
          required
        />

        {error && (
          <div className="p-3 rounded-lg text-sm bg-error/10 text-error">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar contraseña'}
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

export default function RestablecerPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background p-8 rounded-lg border border-border shadow-sm text-center">
          <div className="text-foreground-muted">Cargando...</div>
        </div>
      }
    >
      <RestablecerForm />
    </Suspense>
  );
}
