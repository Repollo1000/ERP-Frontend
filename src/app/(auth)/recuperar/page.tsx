'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
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

  const inputClass = `
    w-full px-4 py-3 rounded-lg
    bg-white border-2 border-gray-200
    text-gray-900 placeholder-gray-400
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
    transition-all duration-200
  `;

  if (enviado) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Revisa tu correo</h2>
        </div>

        <Alert tipo="success">
          Si existe una cuenta con el email <strong>{email}</strong>,
          recibirás un enlace para restablecer tu contraseña.
        </Alert>

        <p className="text-sm text-foreground-muted text-center">
          El enlace expira en 1 hora.
        </p>

        <Link href="/login" className="block">
          <Button variante="secondary" className="w-full">
            Volver al inicio de sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - visible solo en móvil */}
      <div className="lg:hidden text-center mb-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">ERP</span>
        </div>
      </div>

      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Recuperar contraseña</h2>
        <p className="text-foreground-muted mt-2">
          Ingresa tu email y te enviaremos un enlace para restablecerla
        </p>
      </div>

      {/* Error */}
      {error && <Alert tipo="danger">{error}</Alert>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.cl"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        <Button type="submit" className="w-full py-3 text-base" cargando={cargando}>
          Enviar enlace
        </Button>
      </form>

      <div className="text-center pt-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
