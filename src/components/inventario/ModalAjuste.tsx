'use client';

import { useState, type FormEvent } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import type { SolicitudMovimiento } from '@/types';

type TipoAjuste = 'INVENTARIO_INICIAL' | 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA';

interface ModalAjusteProps {
  abierto: boolean;
  productoNombre: string;
  stockActual: number;
  onCerrar: () => void;
  onGuardar: (datos: SolicitudMovimiento) => Promise<{ exito: boolean; error?: string }>;
}

const OPCIONES_TIPO = [
  { valor: 'INVENTARIO_INICIAL', etiqueta: 'Inventario inicial' },
  { valor: 'AJUSTE_ENTRADA', etiqueta: 'Ajuste de entrada' },
  { valor: 'AJUSTE_SALIDA', etiqueta: 'Ajuste de salida' },
];

export function ModalAjuste({
  abierto,
  productoNombre,
  stockActual,
  onCerrar,
  onGuardar,
}: ModalAjusteProps) {
  const [tipo, setTipo] = useState<TipoAjuste>('AJUSTE_ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (tipo === 'AJUSTE_SALIDA' && cantidadNum > stockActual) {
      setError(`Stock insuficiente. Stock actual: ${stockActual}`);
      return;
    }

    setGuardando(true);

    const datos: SolicitudMovimiento = {
      tipo,
      cantidad: cantidadNum,
    };

    if (motivo.trim()) {
      datos.motivo = motivo.trim();
    }

    const resultado = await onGuardar(datos);

    if (resultado.exito) {
      setCantidad('');
      setMotivo('');
      setTipo('AJUSTE_ENTRADA');
      onCerrar();
    } else {
      setError(resultado.error || 'Error al crear ajuste');
    }

    setGuardando(false);
  };

  const handleCerrar = () => {
    setCantidad('');
    setMotivo('');
    setError(null);
    onCerrar();
  };

  return (
    <Modal abierto={abierto} onCerrar={handleCerrar} titulo="Ajuste de inventario">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-background-subtle rounded-[var(--radius)]">
          <p className="text-sm text-foreground-muted">Producto</p>
          <p className="font-medium">{productoNombre}</p>
          <p className="text-sm text-foreground-muted mt-1">Stock actual: {stockActual}</p>
        </div>

        {error && (
          <p className="text-sm text-danger" role="alert">{error}</p>
        )}

        <Select
          etiqueta="Tipo de ajuste"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoAjuste)}
          opciones={OPCIONES_TIPO}
          required
        />

        <Input
          etiqueta="Cantidad"
          name="cantidad"
          type="number"
          step="any"
          min="0.01"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />

        <Input
          etiqueta="Motivo"
          name="motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          ayuda="Opcional"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variante="secondary" onClick={handleCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            Crear ajuste
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalAjuste;
