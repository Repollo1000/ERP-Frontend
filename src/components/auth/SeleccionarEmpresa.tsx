'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import type { Empresa } from '@/types';

interface SeleccionarEmpresaProps {
  empresas: Empresa[];
  error: string | null;
  cargando: boolean;
  onSeleccionar: (empresaId: string) => void;
}

export function SeleccionarEmpresa({
  empresas,
  error,
  cargando,
  onSeleccionar,
}: SeleccionarEmpresaProps) {
  return (
    <Card>
      <CardHeader
        titulo="Seleccionar empresa"
        descripcion="Elige la empresa con la que deseas trabajar"
      />

      <CardContent className="space-y-3">
        {error && (
          <Alert tipo="danger">
            {error}
          </Alert>
        )}

        {empresas.map((empresa) => (
          <button
            key={empresa.id}
            onClick={() => onSeleccionar(empresa.id)}
            disabled={cargando}
            className={`
              w-full p-4 text-left
              bg-background hover:bg-background-subtle
              border border-border rounded-lg
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-primary
            `}
          >
            <div className="font-medium text-foreground">
              {empresa.razonSocial}
            </div>
            <div className="text-sm text-foreground-muted mt-1">
              {empresa.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Usuario'}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
