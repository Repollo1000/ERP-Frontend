'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface CodigosRecuperacionProps {
  codigos: string[];
  onContinuar: () => void;
}

export function CodigosRecuperacion({ codigos, onContinuar }: CodigosRecuperacionProps) {
  const [copiado, setCopiado] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const copiarCodigos = async () => {
    const texto = codigos.join('\n');
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <Card>
      <CardHeader
        titulo="Códigos de recuperación"
        descripcion="Guarda estos códigos en un lugar seguro"
      />

      <CardContent className="space-y-4">
        <Alert tipo="warning" titulo="Importante">
          Estos códigos solo se muestran una vez. Si pierdes acceso a tu aplicación
          de autenticación, podrás usar uno de estos códigos para recuperar tu cuenta.
        </Alert>

        <div className="bg-background-subtle p-4 rounded-lg font-mono text-sm">
          <div className="grid grid-cols-2 gap-2">
            {codigos.map((codigo, index) => (
              <div key={index} className="text-center py-1">
                {codigo}
              </div>
            ))}
          </div>
        </div>

        <Button
          variante="secondary"
          onClick={copiarCodigos}
          className="w-full"
        >
          {copiado ? 'Copiados' : 'Copiar códigos'}
        </Button>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-foreground-muted">
            He guardado estos códigos en un lugar seguro y entiendo que
            no podré verlos de nuevo.
          </span>
        </label>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onContinuar}
          disabled={!confirmado}
          className="w-full"
        >
          Continuar
        </Button>
      </CardFooter>
    </Card>
  );
}
