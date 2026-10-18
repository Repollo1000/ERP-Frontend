'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { api } from '@/lib/api';
import type { SolicitudVenta, Producto, Contacto } from '@/types';

interface LineaFormulario {
  productoId: string;
  productoNombre: string;
  cantidad: string;
  precioUnitario: number;
}

interface FormularioVentaProps {
  onGuardar: (datos: SolicitudVenta) => Promise<{ exito: boolean; error?: string }>;
  onCancelar: () => void;
  guardando?: boolean;
}

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

export function FormularioVenta({
  onGuardar,
  onCancelar,
  guardando = false,
}: FormularioVentaProps) {
  const [clienteId, setClienteId] = useState('');
  const [lineas, setLineas] = useState<LineaFormulario[]>([]);
  const [clientes, setClientes] = useState<Contacto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Cargar clientes y productos
  useEffect(() => {
    const cargar = async () => {
      try {
        const [respClientes, respProductos] = await Promise.all([
          api.get<Contacto[]>('/api/contactos?tipo=cliente'),
          api.get<Producto[]>('/api/productos'),
        ]);
        setClientes(respClientes.filter(c => c.activo));
        setProductos(respProductos.filter(p => p.activo));
      } catch {
        setError('Error al cargar datos');
      } finally {
        setCargandoDatos(false);
      }
    };
    cargar();
  }, []);

  const agregarLinea = () => {
    if (productos.length === 0) return;
    const producto = productos[0];
    setLineas([...lineas, {
      productoId: producto.id,
      productoNombre: producto.nombre,
      cantidad: '1',
      precioUnitario: producto.precioConIva,
    }]);
  };

  const actualizarLinea = (index: number, productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const nuevasLineas = [...lineas];
    nuevasLineas[index] = {
      productoId: producto.id,
      productoNombre: producto.nombre,
      cantidad: nuevasLineas[index].cantidad,
      precioUnitario: producto.precioConIva,
    };
    setLineas(nuevasLineas);
  };

  const actualizarCantidad = (index: number, cantidad: string) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index].cantidad = cantidad;
    setLineas(nuevasLineas);
  };

  const eliminarLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const calcularTotal = (): number => {
    return lineas.reduce((sum, linea) => {
      const cantidad = parseFloat(linea.cantidad) || 0;
      return sum + (cantidad * linea.precioUnitario);
    }, 0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lineas.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    const lineasInvalidas = lineas.some(l => {
      const cantidad = parseFloat(l.cantidad);
      return isNaN(cantidad) || cantidad <= 0;
    });

    if (lineasInvalidas) {
      setError('Todas las cantidades deben ser mayores a 0');
      return;
    }

    const datos: SolicitudVenta = {
      lineas: lineas.map(l => ({
        productoId: l.productoId,
        cantidad: parseFloat(l.cantidad),
      })),
    };

    if (clienteId) {
      datos.clienteId = clienteId;
    }

    const resultado = await onGuardar(datos);
    if (!resultado.exito) {
      setError(resultado.error || 'Error al crear venta');
    }
  };

  if (cargandoDatos) {
    return <p className="text-foreground-muted py-4">Cargando...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-danger" role="alert">{error}</p>
      )}

      <Select
        etiqueta="Cliente"
        name="clienteId"
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
        opciones={[
          { valor: '', etiqueta: 'Sin cliente' },
          ...clientes.map(c => ({ valor: c.id, etiqueta: c.nombre })),
        ]}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">
            Productos
          </label>
          <Button type="button" tamaño="sm" variante="secondary" onClick={agregarLinea}>
            Agregar
          </Button>
        </div>

        {lineas.length === 0 ? (
          <p className="text-sm text-foreground-muted py-4 text-center border border-dashed border-border rounded-[var(--radius)]">
            No hay productos agregados
          </p>
        ) : (
          <div className="space-y-2">
            {lineas.map((linea, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    name={`producto-${index}`}
                    value={linea.productoId}
                    onChange={(e) => actualizarLinea(index, e.target.value)}
                    opciones={productos.map(p => ({
                      valor: p.id,
                      etiqueta: `${p.nombre} - ${formatearPrecio(p.precioConIva)}`,
                    }))}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    value={linea.cantidad}
                    onChange={(e) => actualizarCantidad(index, e.target.value)}
                    placeholder="Cant."
                  />
                </div>
                <div className="w-28 text-right tabular-nums py-2">
                  {formatearPrecio(parseFloat(linea.cantidad || '0') * linea.precioUnitario)}
                </div>
                <Button
                  type="button"
                  variante="ghost"
                  tamaño="sm"
                  onClick={() => eliminarLinea(index)}
                  aria-label="Eliminar línea"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatearPrecio(calcularTotal())}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variante="secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          Crear venta
        </Button>
      </div>
    </form>
  );
}

export default FormularioVenta;
