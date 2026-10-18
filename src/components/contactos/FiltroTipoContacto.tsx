'use client';

import { Button } from '@/components/ui';

type FiltroTipo = 'todos' | 'clientes' | 'proveedores';

interface FiltroTipoContactoProps {
  valor: FiltroTipo;
  onChange: (tipo: FiltroTipo) => void;
}

const opciones: { valor: FiltroTipo; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'clientes', etiqueta: 'Clientes' },
  { valor: 'proveedores', etiqueta: 'Proveedores' },
];

export function FiltroTipoContacto({ valor, onChange }: FiltroTipoContactoProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Filtrar por tipo">
      {opciones.map((opcion) => (
        <Button
          key={opcion.valor}
          variante={valor === opcion.valor ? 'primary' : 'secondary'}
          tamaño="sm"
          onClick={() => onChange(opcion.valor)}
        >
          {opcion.etiqueta}
        </Button>
      ))}
    </div>
  );
}

export default FiltroTipoContacto;
