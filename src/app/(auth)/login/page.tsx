'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  Verificar2FA,
  Configurar2FA,
  CodigosRecuperacion,
  SeleccionarEmpresa,
} from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const {
    cargando,
    error,
    estadoLogin,
    segundosBloqueado,
    datosConfigurar2FA,
    codigosRecuperacion,
    empresasDisponibles,
    login,
    verificar2FA,
    configurar2FA,
    seleccionarEmpresa,
    limpiarError,
    limpiarCodigosRecuperacion,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recordar, setRecordar] = useState(false);

  const manejarLogin = async (e: FormEvent) => {
    e.preventDefault();
    await login({ email, contrasena });
  };

  const volverALogin = () => {
    limpiarError();
    window.location.reload();
  };

  // Mostrar códigos de recuperación después de configurar 2FA
  if (codigosRecuperacion) {
    return (
      <CodigosRecuperacion
        codigos={codigosRecuperacion}
        onContinuar={limpiarCodigosRecuperacion}
      />
    );
  }

  // Seleccionar empresa
  if (estadoLogin === 'seleccionarEmpresa') {
    return (
      <SeleccionarEmpresa
        empresas={empresasDisponibles}
        error={error}
        cargando={cargando}
        onSeleccionar={seleccionarEmpresa}
      />
    );
  }

  // Configurar 2FA por primera vez
  if (estadoLogin === 'requiereConfigurar2FA' && datosConfigurar2FA) {
    return (
      <Configurar2FA
        qrCode={datosConfigurar2FA.qrCode}
        error={error}
        cargando={cargando}
        onConfigurar={configurar2FA}
        onVolver={volverALogin}
      />
    );
  }

  // Verificar 2FA
  if (estadoLogin === 'requiere2FA') {
    return (
      <Verificar2FA
        error={error}
        cargando={cargando}
        segundosBloqueado={segundosBloqueado}
        onVerificar={verificar2FA}
        onVolver={volverALogin}
      />
    );
  }

  // Formulario de login
  const estaBloqueado = segundosBloqueado !== null && segundosBloqueado > 0;

  return (
    <div className="space-y-8">
      {/* Header - visible solo en móvil */}
      <div className="lg:hidden text-center mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">ERP</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenido</h1>
      </div>

      {/* Título del formulario */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Iniciar sesión</h2>
        <p className="text-foreground-muted mt-2">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert tipo="danger">
          {error}
        </Alert>
      )}

      {estaBloqueado && (
        <Alert tipo="warning">
          Cuenta bloqueada. Intenta de nuevo en {Math.ceil(segundosBloqueado / 60)} minutos.
        </Alert>
      )}

      {/* Formulario */}
      <form onSubmit={manejarLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@empresa.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={estaBloqueado}
            className="
              w-full px-4 py-3 rounded-lg
              bg-white border-2 border-gray-200
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Contraseña
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            disabled={estaBloqueado}
            className="
              w-full px-4 py-3 rounded-lg
              bg-white border-2 border-gray-200
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Recordarme */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recordar"
            checked={recordar}
            onChange={(e) => setRecordar(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="recordar" className="text-sm text-foreground-muted">
            Recordarme
          </label>
        </div>

        {/* Botón de login */}
        <Button
          type="submit"
          cargando={cargando}
          disabled={estaBloqueado}
          className="w-full py-3 text-base"
        >
          Iniciar sesión
        </Button>

        {/* Link de recuperación */}
        <div className="text-center">
          <Link
            href="/recuperar"
            className="text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-foreground-muted">
            ¿No tienes cuenta?
          </span>
        </div>
      </div>

      {/* Link de registro */}
      <div className="text-center">
        <Link
          href="/registro"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Crear una cuenta
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-foreground-muted pt-4">
        Al iniciar sesión aceptas nuestros{' '}
        <a href="#" className="underline hover:text-foreground">
          Términos de Servicio
        </a>
        {' '}y{' '}
        <a href="#" className="underline hover:text-foreground">
          Política de Privacidad
        </a>
      </p>
    </div>
  );
}
