'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { api } from '@/lib/api';
import type { SolicitudCompra, Producto, Contacto } from '@/types';

interface LineaFormulario {
  productoId: string;
  productoNombre: string;
  cantidad: string;
  costoUnitario: string;
}

interface FormularioCompraProps {
  onGuardar: (datos: SolicitudCompra) => Promise<{ exito: boolean; error?: string }>;
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

export function FormularioCompra({
  onGuardar,
  onCancelar,
  guardando = false,
}: FormularioCompraProps) {
  const [proveedorId, setProveedorId] = useState('');
  const [folio, setFolio] = useState('');
  const [fechaDocumento, setFechaDocumento] = useState('');
  const [lineas, setLineas] = useState<LineaFormulario[]>([]);
  const [proveedores, setProveedores] = useState<Contacto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [respProveedores, respProductos] = await Promise.all([
          api.get<Contacto[]>('/api/contactos?tipo=proveedor'),
          api.get<Producto[]>('/api/productos'),
        ]);
        setProveedores(respProveedores.filter(c => c.activo));
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
      costoUnitario: '',
    }]);
  };

  const actualizarLinea = (index: number, productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const nuevasLineas = [...lineas];
    nuevasLineas[index] = {
      ...nuevasLineas[index],
      productoId: producto.id,
      productoNombre: producto.nombre,
    };
    setLineas(nuevasLineas);
  };

  const actualizarCantidad = (index: number, cantidad: string) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index].cantidad = cantidad;
    setLineas(nuevasLineas);
  };

  const actualizarCosto = (index: number, costoUnitario: string) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index].costoUnitario = costoUnitario;
    setLineas(nuevasLineas);
  };

  const eliminarLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const calcularNeto = (): number => {
    return lineas.reduce((sum, linea) => {
      const cantidad = parseFloat(linea.cantidad) || 0;
      const costo = parseFloat(linea.costoUnitario) || 0;
      return sum + (cantidad * costo);
    }, 0);
  };

  const calcularIva = (): number => {
    return Math.round(calcularNeto() * 0.19);
  };

  const calcularTotal = (): number => {
    return calcularNeto() + calcularIva();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!folio.trim()) {
      setError('El folio es requerido');
      return;
    }

    if (!fechaDocumento) {
      setError('La fecha del documento es requerida');
      return;
    }

    if (lineas.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    const lineasInvalidas = lineas.some(l => {
      const cantidad = parseFloat(l.cantidad);
      const costo = parseFloat(l.costoUnitario);
      return isNaN(cantidad) || cantidad <= 0 || isNaN(costo) || costo <= 0;
    });

    if (lineasInvalidas) {
      setError('Todas las cantidades y costos deben ser mayores a 0');
      return;
    }

    const datos: SolicitudCompra = {
      folio: folio.trim(),
      fechaDocumento,
      lineas: lineas.map(l => ({
        productoId: l.productoId,
        cantidad: parseFloat(l.cantidad),
        costoUnitario: parseFloat(l.costoUnitario),
      })),
    };

    if (proveedorId) {
      datos.proveedorId = proveedorId;
    }

    const resultado = await onGuardar(datos);
    if (!resultado.exito) {
      setError(resultado.error || 'Error al crear compra');
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          etiqueta="Folio"
          name="folio"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          required
        />
        <Input
          etiqueta="Fecha documento"
          name="fechaDocumento"
          type="date"
          value={fechaDocumento}
          onChange={(e) => setFechaDocumento(e.target.value)}
          required
        />
      </div>

      <Select
        etiqueta="Proveedor"
        name="proveedorId"
        value={proveedorId}
        onChange={(e) => setProveedorId(e.target.value)}
        opciones={[
          { valor: '', etiqueta: 'Sin proveedor' },
          ...proveedores.map(p => ({ valor: p.id, etiqueta: p.nombre })),
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
                      etiqueta: p.nombre,
                    }))}
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    value={linea.cantidad}
                    onChange={(e) => actualizarCantidad(index, e.target.value)}
                    placeholder="Cant."
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={linea.costoUnitario}
                    onChange={(e) => actualizarCosto(index, e.target.value)}
                    placeholder="Costo neto"
                  />
                </div>
                <div className="w-28 text-right tabular-nums py-2">
                  {formatearPrecio((parseFloat(linea.cantidad) || 0) * (parseFloat(linea.costoUnitario) || 0))}
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

      <div className="border-t border-border pt-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Neto</span>
          <span className="tabular-nums">{formatearPrecio(calcularNeto())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>IVA (19%)</span>
          <span className="tabular-nums">{formatearPrecio(calcularIva())}</span>
        </div>
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
          Crear compra
        </Button>
      </div>
    </form>
  );
}

export default FormularioCompra;
