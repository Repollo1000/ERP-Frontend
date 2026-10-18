'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
    <Card>
      <CardHeader
        titulo="Iniciar sesión"
        descripcion="Ingresa tus credenciales para acceder"
      />

      <form onSubmit={manejarLogin}>
        <CardContent className="space-y-4">
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

          <Input
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@empresa.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={estaBloqueado}
          />

          <Input
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            disabled={estaBloqueado}
          />
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            type="submit"
            cargando={cargando}
            disabled={estaBloqueado}
            className="w-full"
          >
            Ingresar
          </Button>

          <p className="text-sm text-foreground-muted text-center">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>

          <Link
            href="/recuperar"
            className="text-sm text-foreground-muted hover:text-primary text-center"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
