'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
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
  const [digitos, setDigitos] = useState<string[]>(['', '', '', '', '', '']);
  const [verificando, setVerificando] = useState(false);
  const [paso, setPaso] = useState<'qr' | 'codigo'>('qr');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const codigoCompleto = digitos.every(d => d !== '');
  const codigo = digitos.join('');

  const manejarCambio = (index: number, valor: string) => {
    const digito = valor.replace(/\D/g, '').slice(-1);
    const nuevosDigitos = [...digitos];
    nuevosDigitos[index] = digito;
    setDigitos(nuevosDigitos);

    if (digito && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const manejarTecla = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digitos[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nuevosDigitos = [...digitos];
        nuevosDigitos[index - 1] = '';
        setDigitos(nuevosDigitos);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const manejarPegar = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (texto) {
      const nuevosDigitos = [...digitos];
      for (let i = 0; i < 6; i++) {
        nuevosDigitos[i] = texto[i] || '';
      }
      setDigitos(nuevosDigitos);
      const ultimoIndex = Math.min(texto.length, 5);
      inputRefs.current[ultimoIndex]?.focus();
    }
  };

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!codigoCompleto) return;

    setVerificando(true);
    try {
      await onConfigurar(codigo);
    } catch {
      setDigitos(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    if (error) {
      setDigitos(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [error]);

  // Enfocar primer input cuando cambia a paso código
  useEffect(() => {
    if (paso === 'codigo') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [paso]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Configurar verificación en dos pasos
        </h2>
        <p className="text-foreground-muted mt-2">
          {paso === 'qr'
            ? 'Escanea el código QR con tu aplicación de autenticación'
            : 'Ingresa el código para verificar la configuración'
          }
        </p>
      </div>

      {/* Pasos */}
      <div className="flex justify-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${paso === 'qr' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground-muted'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
          Escanear
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${paso === 'codigo' ? 'bg-primary text-white' : 'bg-gray-100 text-foreground-muted'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</span>
          Verificar
        </div>
      </div>

      {error && <Alert tipo="danger">{error}</Alert>}

      {paso === 'qr' ? (
        /* Paso 1: QR Code */
        <div className="space-y-6">
          <div className="flex justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div
              className="w-[200px] h-[200px]"
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Aplicaciones compatibles:</p>
                <p className="text-blue-700">Google Authenticator, Authy, Microsoft Authenticator, 1Password</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variante="ghost"
              onClick={onVolver}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => setPaso('codigo')}
              className="flex-1"
            >
              Ya lo escaneé
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      ) : (
        /* Paso 2: Código */
        <form onSubmit={manejarSubmit} className="space-y-6">
          {/* Inputs OTP */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {digitos.map((digito, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digito}
                onChange={(e) => manejarCambio(index, e.target.value)}
                onKeyDown={(e) => manejarTecla(index, e)}
                onPaste={index === 0 ? manejarPegar : undefined}
                onFocus={(e) => e.target.select()}
                disabled={verificando || cargando}
                className={`
                  w-12 h-14 sm:w-14 sm:h-16
                  text-center text-2xl font-bold
                  rounded-xl border-2
                  transition-all duration-200
                  focus:outline-none focus:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${digito
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-gray-200 bg-white text-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10'
                  }
                `}
              />
            ))}
          </div>

          {/* Indicador de progreso */}
          <div className="flex justify-center gap-1.5">
            {digitos.map((digito, index) => (
              <div
                key={index}
                className={`h-1 w-6 rounded-full transition-all duration-300 ${digito ? 'bg-primary' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variante="ghost"
              onClick={() => {
                setPaso('qr');
                setDigitos(['', '', '', '', '', '']);
              }}
              disabled={cargando || verificando}
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Atrás
            </Button>
            <Button
              type="submit"
              cargando={cargando || verificando}
              disabled={!codigoCompleto}
              className="flex-1"
            >
              Verificar y activar
            </Button>
          </div>
        </form>
      )}

      {paso === 'codigo' && (
        <p className="text-center text-sm text-foreground-muted">
          El código cambia cada 30 segundos
        </p>
      )}
    </div>
  );
}
