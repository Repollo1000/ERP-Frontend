'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import type { Contacto, DatosContacto } from '@/types';

interface FormularioContactoProps {
  contacto?: Contacto | null;
  onGuardar: (datos: DatosContacto) => Promise<{ exito: boolean; error?: string; campo?: string }>;
  onCancelar: () => void;
  guardando?: boolean;
}

export function FormularioContacto({
  contacto,
  onGuardar,
  onCancelar,
  guardando = false,
}: FormularioContactoProps) {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [esCliente, setEsCliente] = useState(true);
  const [esProveedor, setEsProveedor] = useState(false);

  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contacto) {
      setNombre(contacto.nombre);
      setRut(contacto.rut || '');
      setEmail(contacto.email || '');
      setTelefono(contacto.telefono || '');
      setDireccion(contacto.direccion || '');
      setEsCliente(contacto.esCliente);
      setEsProveedor(contacto.esProveedor);
    } else {
      setNombre('');
      setRut('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setEsCliente(true);
      setEsProveedor(false);
    }
    setErrores({});
  }, [contacto]);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (nombre.length > 200) {
      nuevosErrores.nombre = 'El nombre no puede tener más de 200 caracteres';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (!esCliente && !esProveedor) {
      nuevosErrores.tipo = 'Debe ser cliente, proveedor o ambos';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    const datos: DatosContacto = {
      nombre: nombre.trim(),
      esCliente,
      esProveedor,
    };

    if (rut.trim()) datos.rut = rut.trim();
    if (email.trim()) datos.email = email.trim();
    if (telefono.trim()) datos.telefono = telefono.trim();
    if (direccion.trim()) datos.direccion = direccion.trim();

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
        etiqueta="Nombre"
        name="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        error={errores.nombre}
        required
        maxLength={200}
      />

      <Input
        etiqueta="RUT"
        name="rut"
        value={rut}
        onChange={(e) => setRut(e.target.value)}
        error={errores.rut}
        ayuda="Opcional"
      />

      <Input
        etiqueta="Email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errores.email}
      />

      <Input
        etiqueta="Teléfono"
        name="telefono"
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      <Input
        etiqueta="Dirección"
        name="direccion"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
      />

      <fieldset>
        <legend className="block text-sm font-medium text-foreground mb-2">
          Tipo de contacto
          {errores.tipo && (
            <span className="text-danger ml-2 font-normal">{errores.tipo}</span>
          )}
        </legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={esCliente}
              onChange={(e) => setEsCliente(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Cliente</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={esProveedor}
              onChange={(e) => setEsProveedor(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Proveedor</span>
          </label>
        </div>
      </fieldset>

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
          {contacto ? 'Guardar cambios' : 'Crear contacto'}
        </Button>
      </div>
    </form>
  );
}

export default FormularioContacto;
