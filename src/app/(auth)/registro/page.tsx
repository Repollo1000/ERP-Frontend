'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/lib/api';
import type { ApiError } from '@/types';

interface SolicitudRegistro {
  email: string;
  contrasena: string;
  rut: string;
  razonSocial: string;
}

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [rut, setRut] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState(false);

  const formatearRut = (valor: string) => {
    // Eliminar todo excepto números y K
    let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();

    if (limpio.length === 0) return '';

    // Separar cuerpo y dígito verificador
    const dv = limpio.slice(-1);
    const cuerpo = limpio.slice(0, -1);

    if (cuerpo.length === 0) return dv;

    // Formatear con puntos
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${cuerpoFormateado}-${dv}`;
  };

  const manejarCambioRut = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formateado = formatearRut(e.target.value);
    setRut(formateado);
  };

  const validarFormulario = (): string | null => {
    if (contrasena.length < 12) {
      return 'La contraseña debe tener al menos 12 caracteres';
    }
    if (contrasena !== confirmarContrasena) {
      return 'Las contraseñas no coinciden';
    }
    if (!rut || rut.length < 3) {
      return 'Ingresa un RUT válido';
    }
    if (!razonSocial.trim()) {
      return 'Ingresa el nombre de la empresa';
    }
    return null;
  };

  const manejarRegistro = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);

    try {
      const solicitud: SolicitudRegistro = {
        email,
        contrasena,
        rut: rut.replace(/\./g, ''), // Enviar sin puntos
        razonSocial: razonSocial.trim(),
      };

      await api.postSinAuth('/api/registro', solicitud);
      setRegistrado(true);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.error === 'email_duplicado' || apiError.error?.includes('email')) {
        setError('Ya existe una cuenta con este correo');
      } else if (apiError.error === 'rut_duplicado' || apiError.error?.includes('rut')) {
        setError('Ya existe una empresa con este RUT');
      } else if (apiError.error?.includes('contrasena') || apiError.error?.includes('password')) {
        setError('La contraseña es muy común, elige otra más segura');
      } else {
        setError('Error al crear la cuenta. Verifica los datos e intenta de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Registro exitoso
  if (registrado) {
    return (
      <Card>
        <CardHeader
          titulo="Verifica tu correo"
          descripcion="Te enviamos un enlace de verificación"
        />
        <CardContent className="space-y-4">
          <Alert tipo="success">
            Cuenta creada exitosamente. Revisa tu correo electrónico ({email}) y
            haz clic en el enlace de verificación para activar tu cuenta.
          </Alert>
          <p className="text-sm text-foreground-muted">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variante="secondary" className="w-full">
              Ir a iniciar sesión
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Formulario de registro
  return (
    <Card>
      <CardHeader
        titulo="Crear cuenta"
        descripcion="Registra tu empresa para comenzar"
      />

      <form onSubmit={manejarRegistro}>
        <CardContent className="space-y-4">
          {error && (
            <Alert tipo="danger">
              {error}
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
          />

          <Input
            etiqueta="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 12 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            ayuda="Mínimo 12 caracteres. Evita contraseñas comunes."
          />

          <Input
            etiqueta="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
            error={
              confirmarContrasena && contrasena !== confirmarContrasena
                ? 'Las contraseñas no coinciden'
                : undefined
            }
          />

          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm font-medium text-foreground mb-3">
              Datos de la empresa
            </p>

            <div className="space-y-4">
              <Input
                etiqueta="RUT de la empresa"
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={manejarCambioRut}
                required
                ayuda="RUT de la empresa o persona natural"
              />

              <Input
                etiqueta="Razón social"
                type="text"
                placeholder="Mi Empresa SpA"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                required
                ayuda="Nombre legal de la empresa"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            type="submit"
            cargando={cargando}
            className="w-full"
          >
            Crear cuenta
          </Button>

          <p className="text-sm text-foreground-muted text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
