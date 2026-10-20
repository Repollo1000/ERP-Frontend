'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ConfiguracionWidget, TipoWidget } from '@/types';

interface ConfiguradorDashboardProps {
  configuracion: ConfiguracionWidget[];
  onGuardar: (config: ConfiguracionWidget[]) => Promise<void>;
  onRestaurar: () => Promise<void>;
}

const NOMBRES_WIDGETS: Record<TipoWidget, { nombre: string; descripcion: string; categoria: string }> = {
  VENTAS_KPI: { nombre: 'Ventas', descripcion: 'KPIs de ventas del día, semana y mes', categoria: 'KPIs' },
  COMPRAS_KPI: { nombre: 'Compras', descripcion: 'KPIs de compras del mes', categoria: 'KPIs' },
  INVENTARIO_KPI: { nombre: 'Inventario', descripcion: 'Estado del inventario y valor estimado', categoria: 'KPIs' },
  CONTACTOS_KPI: { nombre: 'Contactos', descripcion: 'Clientes y proveedores activos', categoria: 'KPIs' },
  GRAFICO_VENTAS_30D: { nombre: 'Gráfico ventas 30 días', descripcion: 'Evolución de ventas últimos 30 días', categoria: 'Gráficos' },
  GRAFICO_VENTAS_DIA: { nombre: 'Gráfico ventas del día', descripcion: 'Ventas por hora del día actual', categoria: 'Gráficos' },
  ALERTAS_INVENTARIO: { nombre: 'Alertas de stock', descripcion: 'Productos con stock bajo o sin stock', categoria: 'Listas' },
  ULTIMAS_VENTAS: { nombre: 'Últimas ventas', descripcion: 'Ventas más recientes', categoria: 'Listas' },
  ULTIMAS_COMPRAS: { nombre: 'Últimas compras', descripcion: 'Compras más recientes', categoria: 'Listas' },
  TOP_CLIENTES: { nombre: 'Mejores clientes', descripcion: 'Clientes con mayor volumen de compras', categoria: 'Listas' },
  TOP_PRODUCTOS: { nombre: 'Productos más vendidos', descripcion: 'Productos con mayor cantidad vendida', categoria: 'Listas' },
};

export function ConfiguradorDashboard({ configuracion, onGuardar, onRestaurar }: ConfiguradorDashboardProps) {
  const [abierto, setAbierto] = useState(false);
  const [configLocal, setConfigLocal] = useState<ConfiguracionWidget[]>(configuracion);
  const [guardando, setGuardando] = useState(false);

  const toggleWidget = (tipo: TipoWidget) => {
    setConfigLocal(prev =>
      prev.map(w => w.tipo === tipo ? { ...w, visible: !w.visible } : w)
    );
  };

  const moverArriba = (index: number) => {
    if (index === 0) return;
    setConfigLocal(prev => {
      const nuevo = [...prev];
      [nuevo[index - 1], nuevo[index]] = [nuevo[index], nuevo[index - 1]];
      return nuevo.map((w, i) => ({ ...w, orden: i }));
    });
  };

  const moverAbajo = (index: number) => {
    if (index === configLocal.length - 1) return;
    setConfigLocal(prev => {
      const nuevo = [...prev];
      [nuevo[index], nuevo[index + 1]] = [nuevo[index + 1], nuevo[index]];
      return nuevo.map((w, i) => ({ ...w, orden: i }));
    });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onGuardar(configLocal);
      setAbierto(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleRestaurar = async () => {
    setGuardando(true);
    try {
      await onRestaurar();
      setAbierto(false);
    } finally {
      setGuardando(false);
    }
  };

  // Agrupar por categoría
  const categorias = configLocal.reduce((acc, widget) => {
    const info = NOMBRES_WIDGETS[widget.tipo];
    if (!info) return acc;
    if (!acc[info.categoria]) acc[info.categoria] = [];
    acc[info.categoria].push(widget);
    return acc;
  }, {} as Record<string, ConfiguracionWidget[]>);

  return (
    <>
      <button
        onClick={() => {
          setConfigLocal(configuracion);
          setAbierto(true);
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-background-subtle transition-colors"
        title="Personalizar dashboard"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Personalizar
      </button>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Personalizar Dashboard"
      >
        <div className="space-y-6">
          <p className="text-sm text-foreground-muted">
            Selecciona los widgets que quieres mostrar y arrastra para reordenar.
          </p>

          {Object.entries(categorias).map(([categoria, widgets]) => (
            <div key={categoria}>
              <h4 className="text-sm font-medium text-foreground-muted mb-2">{categoria}</h4>
              <div className="space-y-2">
                {widgets.map((widget, index) => {
                  const info = NOMBRES_WIDGETS[widget.tipo];
                  const globalIndex = configLocal.findIndex(w => w.tipo === widget.tipo);

                  return (
                    <div
                      key={widget.tipo}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        widget.visible ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={widget.visible}
                        onChange={() => toggleWidget(widget.tipo)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <p className="font-medium">{info?.nombre || widget.tipo}</p>
                        <p className="text-xs text-foreground-muted">{info?.descripcion}</p>
                      </div>

                      {/* Controles de orden */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => moverArriba(globalIndex)}
                          disabled={globalIndex === 0}
                          className="p-1 rounded hover:bg-background-subtle disabled:opacity-30"
                          title="Mover arriba"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moverAbajo(globalIndex)}
                          disabled={globalIndex === configLocal.length - 1}
                          className="p-1 rounded hover:bg-background-subtle disabled:opacity-30"
                          title="Mover abajo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variante="ghost" onClick={handleRestaurar} disabled={guardando}>
              Restaurar predeterminados
            </Button>
            <div className="flex gap-2">
              <Button variante="secondary" onClick={() => setAbierto(false)} disabled={guardando}>
                Cancelar
              </Button>
              <Button onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ConfiguradorDashboard;
