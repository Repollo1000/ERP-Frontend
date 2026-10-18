'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface Verificar2FAProps {
  error: string | null;
  cargando: boolean;
  segundosBloqueado: number | null;
  onVerificar: (codigo: string) => Promise<void> | void;
  onVolver: () => void;
}

export function Verificar2FA({
  error,
  cargando,
  segundosBloqueado,
  onVerificar,
  onVolver,
}: Verificar2FAProps) {
  const [codigo, setCodigo] = useState('');

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onVerificar(codigo);
    } catch (err) {
      console.error('Error en submit:', err);
    }
  };

  const estaBloqueado = segundosBloqueado !== null && segundosBloqueado > 0;

  return (
    <Card>
      <CardHeader
        titulo="Verificación en dos pasos"
        descripcion="Ingresa el código de tu aplicación de autenticación"
      />

      <form onSubmit={manejarSubmit}>
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
            etiqueta="Código de verificación"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            disabled={estaBloqueado}
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
            disabled={codigo.length !== 6 || estaBloqueado}
          >
            Verificar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
