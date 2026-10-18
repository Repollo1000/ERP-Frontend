'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Perfil, ActualizarPerfil } from '@/types';

const ZONAS_HORARIAS = [
  { valor: 'America/Santiago', etiqueta: 'Santiago (GMT-3/-4)' },
  { valor: 'America/Punta_Arenas', etiqueta: 'Punta Arenas (GMT-3)' },
  { valor: 'Pacific/Easter', etiqueta: 'Isla de Pascua (GMT-5/-6)' },
];

const FORMATOS_NUMEROS = [
  { valor: 'es-CL', etiqueta: '1.234,56 (Chile)' },
  { valor: 'en-US', etiqueta: '1,234.56 (EEUU)' },
];

interface PerfilTabProps {
  perfil: Perfil | null;
  cargando: boolean;
  onActualizar: (datos: ActualizarPerfil) => Promise<{ exito: boolean; error?: string }>;
}

export function PerfilTab({ perfil, cargando, onActualizar }: PerfilTabProps) {
  const [nombre, setNombre] = useState('');
  const [zonaHoraria, setZonaHoraria] = useState('America/Santiago');
  const [formatoNumeros, setFormatoNumeros] = useState('es-CL');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombreMostrar || '');
      setZonaHoraria(perfil.zonaHoraria || 'America/Santiago');
      setFormatoNumeros(perfil.formatoNumeros || 'es-CL');
    }
  }, [perfil]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    const resultado = await onActualizar({
      nombreMostrar: nombre || undefined,
      zonaHoraria,
      formatoNumeros,
    });

    setGuardando(false);

    if (resultado.exito) {
      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado correctamente' });
    } else {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al actualizar perfil' });
    }
  };

  if (cargando && !perfil) {
    return <div className="text-foreground-muted">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-medium text-foreground mb-4">Información del perfil</h2>

      <form onSubmit={handleGuardar} className="space-y-4">
        <Input
          etiqueta="Email"
          value={perfil?.email || ''}
          disabled
          className="bg-background-secondary"
        />

        <Input
          etiqueta="Nombre para mostrar"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
        />

        <Select
          etiqueta="Zona horaria"
          value={zonaHoraria}
          onChange={(e) => setZonaHoraria(e.target.value)}
          opciones={ZONAS_HORARIAS}
        />

        <Select
          etiqueta="Formato de números"
          value={formatoNumeros}
          onChange={(e) => setFormatoNumeros(e.target.value)}
          opciones={FORMATOS_NUMEROS}
        />

        {mensaje && (
          <div
            className={`p-3 rounded-lg text-sm ${
              mensaje.tipo === 'exito'
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  );
}
