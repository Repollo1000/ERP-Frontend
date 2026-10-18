'use client';

import { Badge, Button } from '@/components/ui';
import type { Contacto } from '@/types';

interface TablaContactosProps {
  contactos: Contacto[];
  onEditar: (contacto: Contacto) => void;
  onDesactivar: (id: string) => void;
  desactivando?: boolean;
  esAdmin?: boolean;
}

export function TablaContactos({
  contactos,
  onEditar,
  onDesactivar,
  desactivando = false,
  esAdmin = false,
}: TablaContactosProps) {
  if (contactos.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p>No hay contactos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-medium text-foreground-muted">Nombre</th>
            <th className="pb-3 font-medium text-foreground-muted">RUT</th>
            <th className="pb-3 font-medium text-foreground-muted">Email</th>
            <th className="pb-3 font-medium text-foreground-muted">Tipo</th>
            <th className="pb-3 font-medium text-foreground-muted">Estado</th>
            <th className="pb-3 font-medium text-foreground-muted sr-only">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contactos.map((contacto) => (
            <tr
              key={contacto.id}
              className="border-b border-border hover:bg-background-subtle cursor-pointer transition-colors"
              onClick={() => onEditar(contacto)}
            >
              <td className="py-3 font-medium">{contacto.nombre}</td>
              <td className="py-3 text-foreground-muted">{contacto.rut || '-'}</td>
              <td className="py-3 text-foreground-muted">{contacto.email || '-'}</td>
              <td className="py-3">
                <div className="flex gap-1">
                  {contacto.esCliente && (
                    <Badge variante="info">Cliente</Badge>
                  )}
                  {contacto.esProveedor && (
                    <Badge variante="warning">Proveedor</Badge>
                  )}
                </div>
              </td>
              <td className="py-3">
                <Badge variante={contacto.activo ? 'success' : 'default'}>
                  {contacto.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="py-3">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {contacto.activo && esAdmin && (
                    <Button
                      variante="ghost"
                      tamaño="sm"
                      onClick={() => onDesactivar(contacto.id)}
                      disabled={desactivando}
                      aria-label={`Desactivar ${contacto.nombre}`}
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

export default TablaContactos;
