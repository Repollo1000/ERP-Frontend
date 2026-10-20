'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface Verificar2FAProps {
  error: string | null;
  cargando: boolean;
  segundosBloqueado: number | null;
  onVerificar: (codigo: string) => Promise<void> | void;
  onVolver: () => void;
}

type EstadoAnimacion = 'inicial' | 'verificando' | 'desbloqueando' | 'exito';

export function Verificar2FA({
  error,
  cargando,
  segundosBloqueado,
  onVerificar,
  onVolver,
}: Verificar2FAProps) {
  const [digitos, setDigitos] = useState<string[]>(['', '', '', '', '', '']);
  const [estadoAnimacion, setEstadoAnimacion] = useState<EstadoAnimacion>('inicial');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const estaBloqueado = segundosBloqueado !== null && segundosBloqueado > 0;
  const codigoCompleto = digitos.every(d => d !== '');
  const codigo = digitos.join('');

  // Auto-verificar cuando el código está completo
  useEffect(() => {
    if (codigoCompleto && estadoAnimacion === 'inicial' && !estaBloqueado) {
      verificarCodigo();
    }
  }, [codigoCompleto]);

  const verificarCodigo = async () => {
    // Fase 1: Verificando (candado tiembla)
    setEstadoAnimacion('verificando');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Fase 2: Desbloqueando (candado se abre)
    setEstadoAnimacion('desbloqueando');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fase 3: Éxito (brilla)
    setEstadoAnimacion('exito');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Llamar al callback
    try {
      await onVerificar(codigo);
    } catch {
      // Si falla, resetear todo
      setEstadoAnimacion('inicial');
      setDigitos(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

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
    if (codigoCompleto && estadoAnimacion === 'inicial') {
      await verificarCodigo();
    }
  };

  // Reset cuando hay error
  useEffect(() => {
    if (error) {
      setEstadoAnimacion('inicial');
      setDigitos(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [error]);

  const enProceso = estadoAnimacion !== 'inicial';
  const esExito = estadoAnimacion === 'exito';
  const estaDesbloqueando = estadoAnimacion === 'desbloqueando' || estadoAnimacion === 'exito';

  return (
    <div className="space-y-8">
      {/* Header con candado animado */}
      <div className="text-center">
        <div className={`
          relative w-28 h-28 mx-auto mb-6
          transition-all ease-out
          ${estadoAnimacion === 'verificando' ? 'animate-pulse duration-300' : ''}
          ${esExito ? 'scale-110 duration-700' : 'duration-500'}
        `}>
          {/* Resplandor de fondo */}
          <div className={`
            absolute inset-0 rounded-full blur-xl
            transition-all duration-1000 ease-out
            ${esExito ? 'bg-green-400/40 scale-150' : 'bg-transparent scale-100'}
          `}></div>

          {/* Cuerpo del candado */}
          <div className={`
            absolute bottom-2 left-1/2 -translate-x-1/2
            w-16 h-12 rounded-lg
            transition-all ease-out
            ${esExito ? 'duration-500' : 'duration-700'}
            ${esExito
              ? 'bg-green-500 shadow-xl shadow-green-500/50'
              : estaDesbloqueando
                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                : 'bg-primary shadow-lg shadow-primary/30'
            }
          `}>
            {/* Ojo de cerradura */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <div className={`
                w-3 h-3 rounded-full transition-all duration-500
                ${estaDesbloqueando ? 'bg-green-200' : 'bg-white/30'}
              `}></div>
              <div className={`
                w-1.5 h-3 mx-auto -mt-0.5 rounded-b transition-all duration-500
                ${estaDesbloqueando ? 'bg-green-200' : 'bg-white/30'}
              `}></div>
            </div>
          </div>

          {/* Arco del candado */}
          <div className={`
            absolute top-2 left-1/2 -translate-x-1/2
            w-12 h-10 border-4 rounded-t-full
            origin-bottom-right
            transition-all ease-out
            ${estaDesbloqueando
              ? 'border-green-500 -rotate-45 translate-x-2 duration-700'
              : 'border-primary rotate-0 duration-300'
            }
          `}></div>

          {/* Partículas de éxito */}
          {esExito && (
            <>
              <div
                className="absolute top-0 left-4 w-2 h-2 bg-green-400 rounded-full"
                style={{ animation: 'float-up 1.5s ease-out forwards' }}
              ></div>
              <div
                className="absolute top-2 right-4 w-3 h-3 bg-green-300 rounded-full"
                style={{ animation: 'float-up 1.5s ease-out 0.2s forwards' }}
              ></div>
              <div
                className="absolute top-4 left-2 w-1.5 h-1.5 bg-green-500 rounded-full"
                style={{ animation: 'float-up 1.5s ease-out 0.4s forwards' }}
              ></div>
              <div
                className="absolute top-6 right-2 w-2 h-2 bg-green-400 rounded-full"
                style={{ animation: 'float-up 1.5s ease-out 0.3s forwards' }}
              ></div>
              <div
                className="absolute bottom-8 left-6 w-1 h-1 bg-green-300 rounded-full"
                style={{ animation: 'float-up 1.5s ease-out 0.5s forwards' }}
              ></div>
            </>
          )}

          {/* Check mark que aparece */}
          {esExito && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white drop-shadow-lg"
                style={{ animation: 'pop-in 0.5s ease-out 0.3s both' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: 24,
                    animation: 'draw-check 0.6s ease-out 0.5s forwards'
                  }}
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className={`
          text-2xl font-bold transition-all duration-500
          ${esExito ? 'text-green-600' : 'text-foreground'}
        `}>
          {esExito
            ? 'Verificado'
            : estadoAnimacion === 'desbloqueando'
              ? 'Desbloqueando...'
              : estadoAnimacion === 'verificando'
                ? 'Verificando...'
                : 'Verificación en dos pasos'
          }
        </h2>
        <p className="text-foreground-muted mt-2 transition-all duration-300">
          {esExito
            ? 'Acceso concedido, redirigiendo...'
            : estadoAnimacion !== 'inicial'
              ? 'Espera un momento...'
              : 'Ingresa el código de tu aplicación de autenticación'
          }
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
              disabled={estaBloqueado || enProceso}
              autoFocus={index === 0}
              className={`
                w-12 h-14 sm:w-14 sm:h-16
                text-center text-2xl font-bold
                rounded-xl border-2
                focus:outline-none focus:scale-105
                disabled:cursor-not-allowed
                transition-all
                ${enProceso ? 'duration-500' : 'duration-200'}
                ${digito
                  ? esExito
                    ? 'border-green-500 bg-green-50 text-green-700 scale-105'
                    : estaDesbloqueando
                      ? 'border-green-400 bg-green-50/50 text-green-600'
                      : 'border-primary bg-primary/5 text-foreground'
                  : 'border-gray-200 bg-white text-foreground'
                }
                ${!digito && !estaBloqueado && !enProceso
                  ? 'hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10'
                  : ''
                }
              `}
              style={{
                transitionDelay: enProceso ? `${index * 80}ms` : '0ms'
              }}
            />
          ))}
        </div>

        {/* Indicador de progreso */}
        <div className="flex justify-center gap-1.5">
          {digitos.map((digito, index) => (
            <div
              key={index}
              className={`
                h-1.5 w-8 rounded-full
                transition-all
                ${enProceso ? 'duration-500' : 'duration-300'}
                ${digito
                  ? esExito
                    ? 'bg-green-500 scale-110'
                    : estaDesbloqueando
                      ? 'bg-green-400'
                      : 'bg-primary'
                  : 'bg-gray-200'
                }
              `}
              style={{
                transitionDelay: enProceso ? `${index * 100}ms` : '0ms'
              }}
            ></div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variante="ghost"
            onClick={onVolver}
            disabled={cargando || enProceso}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Button>
          <Button
            type="submit"
            cargando={cargando || (enProceso && !esExito)}
            disabled={!codigoCompleto || estaBloqueado || enProceso}
            className={`flex-1 transition-all duration-500 ${esExito ? 'bg-green-500 hover:bg-green-500' : ''}`}
          >
            {esExito ? 'Verificado' : 'Verificar'}
          </Button>
        </div>
      </form>

      {/* Ayuda */}
      {!enProceso && (
        <p className="text-center text-sm text-foreground-muted">
          Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.)
          y copia el código de 6 dígitos.
        </p>
      )}

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.5);
          }
        }

        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
