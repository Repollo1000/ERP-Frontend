'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface Configurar2FAProps {
  qrCode: string;
  error: string | null;
  cargando: boolean;
  onConfigurar: (codigo: string) => Promise<void> | void;
  onVolver: () => void;
}

export function Configurar2FA({
  qrCode,
  error,
  cargando,
  onConfigurar,
  onVolver,
}: Configurar2FAProps) {
  const [codigo, setCodigo] = useState('');

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onConfigurar(codigo);
    } catch (err) {
      console.error('Error en submit:', err);
    }
  };

  return (
    <Card>
      <CardHeader
        titulo="Configurar verificación en dos pasos"
        descripcion="Escanea el código QR con tu aplicación de autenticación"
      />

      <form onSubmit={manejarSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert tipo="danger">
              {error}
            </Alert>
          )}

          <div className="flex justify-center p-4 bg-white rounded-lg">
            {/* El QR viene como SVG directo del backend */}
            <div
              className="w-[220px] h-[220px]"
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
          </div>

          <Alert tipo="info">
            Usa Google Authenticator, Authy u otra aplicación compatible con TOTP.
          </Alert>

          <Input
            etiqueta="Código de verificación"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            required
            ayuda="Ingresa el código de 6 dígitos de tu aplicación"
          />
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            variante="ghost"
            onClick={onVolver}
            disabled={cargando}
          >
            Volver
          </Button>
          <Button
            type="submit"
            cargando={cargando}
            disabled={codigo.length !== 6}
          >
            Verificar y activar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
