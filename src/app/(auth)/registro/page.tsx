'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
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
    let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length === 0) return '';
    const dv = limpio.slice(-1);
    const cuerpo = limpio.slice(0, -1);
    if (cuerpo.length === 0) return dv;
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
        rut: rut.replace(/\./g, ''),
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

  const inputClass = `
    w-full px-4 py-3 rounded-lg
    bg-white border-2 border-gray-200
    text-gray-900 placeholder-gray-400
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
    transition-all duration-200
  `;

  // Registro exitoso
  if (registrado) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Verifica tu correo</h2>
          <p className="text-foreground-muted mt-2">Te enviamos un enlace de verificación</p>
        </div>

        <Alert tipo="success">
          Cuenta creada exitosamente. Revisa tu correo electrónico ({email}) y
          haz clic en el enlace de verificación para activar tu cuenta.
        </Alert>

        <p className="text-sm text-foreground-muted text-center">
          Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
        </p>

        <Link href="/login" className="block">
          <Button variante="secondary" className="w-full">
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  // Formulario de registro
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
        <h2 className="text-3xl font-bold text-foreground">Crear cuenta</h2>
        <p className="text-foreground-muted mt-2">
          Registra tu empresa para comenzar
        </p>
      </div>

      {/* Alertas */}
      {error && <Alert tipo="danger">{error}</Alert>}

      {/* Formulario */}
      <form onSubmit={manejarRegistro} className="space-y-4">
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
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Contraseña
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 12 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            className={inputClass}
          />
          <p className="text-xs text-foreground-muted mt-1">
            Mínimo 12 caracteres. Evita contraseñas comunes.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Confirmar contraseña
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
            className={`${inputClass} ${
              confirmarContrasena && contrasena !== confirmarContrasena
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
          />
          {confirmarContrasena && contrasena !== confirmarContrasena && (
            <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        {/* Datos de empresa */}
        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-sm font-medium text-foreground">Datos de la empresa</p>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              RUT de la empresa
            </label>
            <input
              type="text"
              placeholder="12.345.678-9"
              value={rut}
              onChange={manejarCambioRut}
              required
              className={inputClass}
            />
            <p className="text-xs text-foreground-muted mt-1">
              RUT de la empresa o persona natural
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Razón social
            </label>
            <input
              type="text"
              placeholder="Mi Empresa SpA"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              required
              className={inputClass}
            />
            <p className="text-xs text-foreground-muted mt-1">
              Nombre legal de la empresa
            </p>
          </div>
        </div>

        <Button
          type="submit"
          cargando={cargando}
          className="w-full py-3 text-base"
        >
          Crear cuenta
        </Button>

        <p className="text-sm text-foreground-muted text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-foreground-muted pt-2">
        Al crear una cuenta aceptas nuestros{' '}
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
