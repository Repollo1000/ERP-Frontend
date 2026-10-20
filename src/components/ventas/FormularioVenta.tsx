'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Button, Input, Select, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import type { SolicitudVenta, Producto, Contacto } from '@/types';

interface LineaFormulario {
  productoId: string;
  productoNombre: string;
  cantidad: string;
  precioUnitario: number;
  unidad: string;
}

interface FormularioVentaProps {
  onGuardar: (datos: SolicitudVenta) => Promise<{ exito: boolean; error?: string }>;
  onCancelar: () => void;
  guardando?: boolean;
}

// Constante de IVA Chile
const IVA_PORCENTAJE = 19;

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

function formatearUnidad(unidad: string, cantidad: number): string {
  const unidades: Record<string, { singular: string; plural: string }> = {
    UNIDAD: { singular: 'unidad', plural: 'unidades' },
    KILOGRAMO: { singular: 'kg', plural: 'kg' },
    GRAMO: { singular: 'g', plural: 'g' },
    LITRO: { singular: 'L', plural: 'L' },
    METRO: { singular: 'm', plural: 'm' },
    CAJA: { singular: 'caja', plural: 'cajas' },
  };
  const u = unidades[unidad] || { singular: unidad, plural: unidad };
  return cantidad === 1 ? u.singular : u.plural;
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
  const [busquedaProducto, setBusquedaProducto] = useState('');

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

  // Calcular totales
  const totales = useMemo(() => {
    const totalConIva = lineas.reduce((sum, linea) => {
      const cantidad = parseFloat(linea.cantidad) || 0;
      return sum + (cantidad * linea.precioUnitario);
    }, 0);

    // Los precios ya incluyen IVA, así que calculamos el neto
    const neto = Math.round(totalConIva / (1 + IVA_PORCENTAJE / 100));
    const iva = totalConIva - neto;

    return { neto, iva, total: totalConIva };
  }, [lineas]);

  // Cliente seleccionado
  const clienteSeleccionado = useMemo(() => {
    return clientes.find(c => c.id === clienteId);
  }, [clientes, clienteId]);

  // Productos filtrados por búsqueda
  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto) return productos;
    const busqueda = busquedaProducto.toLowerCase();
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda) ||
      p.codigo?.toLowerCase().includes(busqueda)
    );
  }, [productos, busquedaProducto]);

  const agregarLinea = (producto?: Producto) => {
    const prod = producto || productos[0];
    if (!prod) return;

    setLineas([...lineas, {
      productoId: prod.id,
      productoNombre: prod.nombre,
      cantidad: '1',
      precioUnitario: prod.precioConIva,
      unidad: prod.unidad,
    }]);
    setBusquedaProducto('');
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
      unidad: producto.unidad,
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
    return (
      <div className="py-8 text-center">
        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground-muted mt-2">Cargando productos y clientes...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-danger-light border border-danger text-danger-700 rounded-[var(--radius)] p-3 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Sección Cliente */}
      <div className="bg-background-subtle rounded-[var(--radius)] p-4 space-y-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Cliente
        </h3>

        <Select
          name="clienteId"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          opciones={[
            { valor: '', etiqueta: 'Venta sin cliente (boleta)' },
            ...clientes.map(c => ({
              valor: c.id,
              etiqueta: c.rut ? `${c.nombre} - ${c.rut}` : c.nombre
            })),
          ]}
        />

        {clienteSeleccionado && (
          <div className="text-sm text-foreground-muted space-y-1 pl-2 border-l-2 border-primary">
            {clienteSeleccionado.rut && <p><strong>RUT:</strong> {clienteSeleccionado.rut}</p>}
            {clienteSeleccionado.direccion && <p><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>}
            {clienteSeleccionado.telefono && <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>}
          </div>
        )}
      </div>

      {/* Sección Productos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Productos
            {lineas.length > 0 && (
              <Badge variante="info">{lineas.length}</Badge>
            )}
          </h3>
        </div>

        {/* Buscador de productos */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
            />
            {busquedaProducto && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-[var(--radius)] shadow-lg max-h-60 overflow-y-auto">
                {productosFiltrados.slice(0, 10).map(producto => (
                  <button
                    key={producto.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-background-subtle flex justify-between items-center"
                    onClick={() => agregarLinea(producto)}
                  >
                    <span>
                      {producto.codigo && <span className="text-foreground-muted">{producto.codigo} - </span>}
                      {producto.nombre}
                    </span>
                    <span className="text-primary font-medium">{formatearPrecio(producto.precioConIva)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="button" variante="secondary" onClick={() => agregarLinea()}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        {/* Lista de productos agregados */}
        {lineas.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-border rounded-[var(--radius)]">
            <svg className="w-12 h-12 mx-auto text-foreground-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-foreground-muted mt-2">No hay productos agregados</p>
            <p className="text-sm text-foreground-muted">Busca o agrega productos para continuar</p>
          </div>
        ) : (
          <div className="border border-border rounded-[var(--radius)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-background-subtle">
                <tr className="text-left text-sm">
                  <th className="px-3 py-2 font-medium text-foreground-muted">Producto</th>
                  <th className="px-3 py-2 font-medium text-foreground-muted text-center w-28">Cantidad</th>
                  <th className="px-3 py-2 font-medium text-foreground-muted text-right w-28">P. Unit.</th>
                  <th className="px-3 py-2 font-medium text-foreground-muted text-right w-28">Subtotal</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lineas.map((linea, index) => {
                  const cantidad = parseFloat(linea.cantidad) || 0;
                  const subtotal = cantidad * linea.precioUnitario;
                  return (
                    <tr key={index} className="hover:bg-background-subtle/50">
                      <td className="px-3 py-2">
                        <Select
                          name={`producto-${index}`}
                          value={linea.productoId}
                          onChange={(e) => actualizarLinea(index, e.target.value)}
                          opciones={productos.map(p => ({
                            valor: p.id,
                            etiqueta: p.codigo ? `${p.codigo} - ${p.nombre}` : p.nombre,
                          }))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="any"
                            min="0.01"
                            value={linea.cantidad}
                            onChange={(e) => actualizarCantidad(index, e.target.value)}
                            className="text-center"
                          />
                          <span className="text-xs text-foreground-muted whitespace-nowrap">
                            {formatearUnidad(linea.unidad, cantidad)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-foreground-muted">
                        {formatearPrecio(linea.precioUnitario)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {formatearPrecio(subtotal)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => eliminarLinea(index)}
                          className="p-1 text-foreground-muted hover:text-danger transition-colors"
                          aria-label="Eliminar línea"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen de totales */}
      {lineas.length > 0 && (
        <div className="bg-background-subtle rounded-[var(--radius)] p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Resumen
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Subtotal ({lineas.length} {lineas.length === 1 ? 'producto' : 'productos'})</span>
              <span className="tabular-nums">{formatearPrecio(totales.total)}</span>
            </div>

            <div className="border-t border-border my-2"></div>

            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Neto</span>
              <span className="tabular-nums">{formatearPrecio(totales.neto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">IVA ({IVA_PORCENTAJE}%)</span>
              <span className="tabular-nums">{formatearPrecio(totales.iva)}</span>
            </div>

            <div className="border-t border-border my-2"></div>

            <div className="flex justify-between text-xl font-bold">
              <span>Total a pagar</span>
              <span className="tabular-nums text-primary">{formatearPrecio(totales.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <p className="text-sm text-foreground-muted">
          {lineas.length === 0 ? (
            'Agrega productos para continuar'
          ) : (
            `${lineas.length} ${lineas.length === 1 ? 'producto' : 'productos'} en la venta`
          )}
        </p>
        <div className="flex gap-3">
          <Button type="button" variante="secondary" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            cargando={guardando}
            disabled={lineas.length === 0}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmar venta
          </Button>
        </div>
      </div>
    </form>
  );
}

export default FormularioVenta;
