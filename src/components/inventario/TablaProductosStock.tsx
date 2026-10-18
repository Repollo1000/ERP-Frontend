'use client';

import { Badge } from '@/components/ui';
import type { Producto, UnidadProducto } from '@/types';

interface ProductoConStock extends Producto {
  stock: number;
}

const ETIQUETAS_UNIDAD: Record<UnidadProducto, string> = {
  UNIDAD: 'un',
  KILOGRAMO: 'kg',
  GRAMO: 'g',
  LITRO: 'L',
  METRO: 'm',
  CAJA: 'caja',
};

interface TablaProductosStockProps {
  productos: ProductoConStock[];
  onSeleccionar: (producto: ProductoConStock) => void;
}

export function TablaProductosStock({ productos, onSeleccionar }: TablaProductosStockProps) {
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
            <th className="pb-3 font-medium text-foreground-muted text-right">Stock</th>
            <th className="pb-3 font-medium text-foreground-muted">Estado</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const stockBajo = producto.stockMinimo !== undefined && producto.stock < producto.stockMinimo;

            return (
              <tr
                key={producto.id}
                className="border-b border-border hover:bg-background-subtle cursor-pointer transition-colors"
                onClick={() => onSeleccionar(producto)}
              >
                <td className="py-3 text-foreground-muted">{producto.codigo || '-'}</td>
                <td className="py-3 font-medium">{producto.nombre}</td>
                <td className="py-3 text-right">
                  <span className={`tabular-nums ${stockBajo ? 'text-warning font-medium' : ''}`}>
                    {producto.stock} {ETIQUETAS_UNIDAD[producto.unidad]}
                  </span>
                  {stockBajo && (
                    <Badge variante="warning" className="ml-2">Bajo</Badge>
                  )}
                </td>
                <td className="py-3">
                  <Badge variante={producto.activo ? 'success' : 'default'}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProductosStock;
