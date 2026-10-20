'use client';

import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Widget, ConfiguradorDashboard } from '@/components/dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import type { ConfiguracionWidget, TipoWidget } from '@/types';

export default function InicioPage() {
  const { usuario } = useAuth();
  const {
    kpis,
    configuracion,
    cargando,
    error,
    guardarConfiguracion,
    restaurarConfiguracion,
    obtenerWidgetsVisibles,
  } = useDashboard();

  if (!usuario?.empresaActiva) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const esAdmin = usuario.empresaActiva.rol === 'ADMINISTRADOR';
  const widgetsVisibles = obtenerWidgetsVisibles();

  // Función para determinar las clases de grid según el tipo de widget
  const getWidgetClasses = (tipo: TipoWidget): string => {
    // El gráfico de 30 días ocupa 2 columnas
    if (tipo === 'GRAFICO_VENTAS_30D') {
      return 'md:col-span-2';
    }
    return '';
  };

  const handleGuardarConfig = async (config: ConfiguracionWidget[]) => {
    await guardarConfiguracion({ widgets: config });
  };

  const handleRestaurarConfig = async () => {
    await restaurarConfiguracion();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {usuario.empresaActiva.razonSocial}
          </h1>
          <p className="text-foreground-muted mt-1">
            Panel de control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConfiguradorDashboard
            configuracion={configuracion.widgets}
            onGuardar={handleGuardarConfig}
            onRestaurar={handleRestaurarConfig}
          />
          <Badge variante={esAdmin ? 'info' : 'default'}>
            {esAdmin ? 'Administrador' : 'Usuario'}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert tipo="danger" titulo="Error">
          {error}
        </Alert>
      )}

      {cargando ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {widgetsVisibles.map((widget) => (
            <div key={widget.tipo} className={getWidgetClasses(widget.tipo)}>
              <Widget
                tipo={widget.tipo}
                datos={kpis}
                cargando={cargando}
              />
            </div>
          ))}
        </div>
      )}

      {!cargando && widgetsVisibles.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p>No hay widgets visibles</p>
          <p className="text-sm mt-1">Usa el botón &quot;Personalizar&quot; para agregar widgets</p>
        </div>
      )}
    </div>
  );
}
