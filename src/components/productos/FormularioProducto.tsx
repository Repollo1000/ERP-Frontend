'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button, Input, Select } from '@/components/ui';
import type { Producto, DatosProducto, UnidadProducto } from '@/types';

const OPCIONES_UNIDAD = [
  { valor: 'UNIDAD', etiqueta: 'Unidad' },
  { valor: 'KILOGRAMO', etiqueta: 'Kilogramo' },
  { valor: 'GRAMO', etiqueta: 'Gramo' },
  { valor: 'LITRO', etiqueta: 'Litro' },
  { valor: 'METRO', etiqueta: 'Metro' },
  { valor: 'CAJA', etiqueta: 'Caja' },
];

interface FormularioProductoProps {
  producto?: Producto | null;
  onGuardar: (datos: DatosProducto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  onCancelar: () => void;
  guardando?: boolean;
}

export function FormularioProducto({
  producto,
  onGuardar,
  onCancelar,
  guardando = false,
}: FormularioProductoProps) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState<UnidadProducto>('UNIDAD');
  const [precioConIva, setPrecioConIva] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');

  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cargar datos si es edición
  useEffect(() => {
    if (producto) {
      setCodigo(producto.codigo || '');
      setNombre(producto.nombre);
      setUnidad(producto.unidad);
      setPrecioConIva(producto.precioConIva.toString());
      setStockMinimo(producto.stockMinimo?.toString() || '');
    } else {
      setCodigo('');
      setNombre('');
      setUnidad('UNIDAD');
      setPrecioConIva('');
      setStockMinimo('');
    }
    setErrores({});
  }, [producto]);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (nombre.length > 200) {
      nuevosErrores.nombre = 'El nombre no puede tener más de 200 caracteres';
    }

    if (codigo && !/^[A-Za-z0-9._-]*$/.test(codigo)) {
      nuevosErrores.codigo = 'Solo letras, números, puntos, guiones y guiones bajos';
    } else if (codigo && codigo.length > 50) {
      nuevosErrores.codigo = 'El código no puede tener más de 50 caracteres';
    }

    const precio = parseFloat(precioConIva);
    if (!precioConIva || isNaN(precio)) {
      nuevosErrores.precioConIva = 'El precio es requerido';
    } else if (precio <= 0) {
      nuevosErrores.precioConIva = 'El precio debe ser mayor a 0';
    }

    if (stockMinimo) {
      const stock = parseFloat(stockMinimo);
      if (isNaN(stock) || stock < 0) {
        nuevosErrores.stockMinimo = 'El stock mínimo debe ser un número positivo';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    const datos: DatosProducto = {
      nombre: nombre.trim(),
      unidad,
      precioConIva: parseFloat(precioConIva),
    };

    if (codigo.trim()) {
      datos.codigo = codigo.trim();
    }

    if (stockMinimo) {
      datos.stockMinimo = parseFloat(stockMinimo);
    }

    const resultado = await onGuardar(datos);

    if (!resultado.exito) {
      if (resultado.campo) {
        setErrores((prev) => ({ ...prev, [resultado.campo!]: resultado.error! }));
      } else {
        setErrores((prev) => ({ ...prev, general: resultado.error! }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errores.general && (
        <p className="text-sm text-danger" role="alert">
          {errores.general}
        </p>
      )}

      <Input
        etiqueta="Código"
        name="codigo"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        error={errores.codigo}
        ayuda="Opcional. Solo letras, números, puntos, guiones"
        maxLength={50}
      />

      <Input
        etiqueta="Nombre"
        name="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        error={errores.nombre}
        required
        maxLength={200}
      />

      <Select
        etiqueta="Unidad de medida"
        name="unidad"
        value={unidad}
        onChange={(e) => setUnidad(e.target.value as UnidadProducto)}
        opciones={OPCIONES_UNIDAD}
        required
      />

      <Input
        etiqueta="Precio con IVA"
        name="precioConIva"
        type="number"
        step="1"
        min="1"
        value={precioConIva}
        onChange={(e) => setPrecioConIva(e.target.value)}
        error={errores.precioConIva}
        required
      />

      <Input
        etiqueta="Stock mínimo"
        name="stockMinimo"
        type="number"
        step="any"
        min="0"
        value={stockMinimo}
        onChange={(e) => setStockMinimo(e.target.value)}
        error={errores.stockMinimo}
        ayuda="Opcional. Alerta cuando el stock baje de este valor"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variante="secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          {producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}

export default FormularioProducto;
