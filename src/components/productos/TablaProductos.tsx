'use client';

import { Badge, Button } from '@/components/ui';
import type { Producto, UnidadProducto } from '@/types';

const ETIQUETAS_UNIDAD: Record<UnidadProducto, string> = {
  UNIDAD: 'Unidad',
  KILOGRAMO: 'Kg',
  GRAMO: 'g',
  LITRO: 'L',
  METRO: 'm',
  CAJA: 'Caja',
};

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

interface TablaProductosProps {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  onDesactivar: (id: string) => void;
  desactivando?: boolean;
  esAdmin?: boolean;
}

export function TablaProductos({
  productos,
  onEditar,
  onDesactivar,
  desactivando = false,
  esAdmin = false,
}: TablaProductosProps) {
  if (productos.length === 0) {
    return (
      <div className="text-center py-12 text-foreground-muted">
        <svg
          className="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p>No hay productos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-medium text-foreground-muted">Código</th>
            <th className="pb-3 font-medium text-foreground-muted">Nombre</th>
            <th className="pb-3 font-medium text-foreground-muted">Unidad</th>
            <th className="pb-3 font-medium text-foreground-muted text-right">Precio</th>
            <th className="pb-3 font-medium text-foreground-muted">Estado</th>
            <th className="pb-3 font-medium text-foreground-muted sr-only">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr
              key={producto.id}
              className="border-b border-border hover:bg-background-subtle cursor-pointer transition-colors"
              onClick={() => onEditar(producto)}
            >
              <td className="py-3 text-foreground-muted">
                {producto.codigo || '-'}
              </td>
              <td className="py-3 font-medium">{producto.nombre}</td>
              <td className="py-3">{ETIQUETAS_UNIDAD[producto.unidad]}</td>
              <td className="py-3 text-right tabular-nums">
                {formatearPrecio(producto.precioConIva)}
              </td>
              <td className="py-3">
                <Badge variante={producto.activo ? 'success' : 'default'}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="py-3">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {producto.activo && esAdmin && (
                    <Button
                      variante="ghost"
                      tamaño="sm"
                      onClick={() => onDesactivar(producto.id)}
                      disabled={desactivando}
                      aria-label={`Desactivar ${producto.nombre}`}
                    >
                      Desactivar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProductos;
