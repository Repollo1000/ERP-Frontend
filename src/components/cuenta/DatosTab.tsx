'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface DatosTabProps {
  onExportar: () => Promise<{ exito: boolean; datos?: unknown; error?: string }>;
}

export function DatosTab({ onExportar }: DatosTabProps) {
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const handleExportar = async () => {
    setExportando(true);
    setMensaje(null);

    const resultado = await onExportar();

    setExportando(false);

    if (resultado.exito && resultado.datos) {
      // Descargar como JSON
      const blob = new Blob([JSON.stringify(resultado.datos, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mis-datos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMensaje({ tipo: 'exito', texto: 'Datos exportados correctamente' });
    } else {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al exportar datos' });
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">Exportar mis datos</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Descarga una copia de todos tus datos personales almacenados en el sistema.
          Esto incluye tu perfil, preferencias y registro de actividad.
        </p>

        {mensaje && (
          <div
            className={`p-3 rounded-lg text-sm mb-4 ${
              mensaje.tipo === 'exito'
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <Button onClick={handleExportar} disabled={exportando}>
          {exportando ? 'Exportando...' : 'Descargar mis datos'}
        </Button>
      </section>

      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">Tus derechos</h2>
        <div className="text-sm text-foreground-muted space-y-3">
          <p>
            De acuerdo con la Ley 21.719 de Protección de Datos Personales, tienes derecho a:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Acceso:</strong> Conocer qué datos personales tenemos sobre ti
            </li>
            <li>
              <strong>Rectificación:</strong> Corregir datos inexactos o incompletos
            </li>
            <li>
              <strong>Supresión:</strong> Solicitar la eliminación de tus datos cuando proceda
            </li>
            <li>
              <strong>Oposición:</strong> Oponerte al tratamiento en ciertos casos
            </li>
            <li>
              <strong>Portabilidad:</strong> Recibir tus datos en formato estructurado
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, puedes exportar tus datos arriba o contactar
            al administrador de tu empresa.
          </p>
        </div>
      </section>
    </div>
  );
}
