'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui';

interface BusquedaContactosProps {
  onBuscar: (texto: string) => void;
  valorInicial?: string;
}

export function BusquedaContactos({ onBuscar, valorInicial = '' }: BusquedaContactosProps) {
  const [texto, setTexto] = useState(valorInicial);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onBuscar(texto);
    }, 300);

    return () => clearTimeout(timeout);
  }, [texto, onBuscar]);

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre, RUT o email..."
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      iconoIzquierda={
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      className="max-w-sm"
    />
  );
}

export default BusquedaContactos;
