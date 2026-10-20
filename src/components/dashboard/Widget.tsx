'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import type { TipoWidget, KPIsCompletos } from '@/types';

interface WidgetProps {
  tipo: TipoWidget;
  datos: KPIsCompletos | null;
  cargando?: boolean;
}

function formatearPrecio(precio: number | undefined): string {
  if (precio === undefined || precio === null) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

function formatearVariacion(variacion?: number): React.ReactNode {
  if (variacion === undefined || variacion === null) return null;
  const positivo = variacion >= 0;
  return (
    <span className={`text-xs ${positivo ? 'text-success' : 'text-danger'}`}>
      {positivo ? '+' : ''}{variacion.toFixed(1)}%
    </span>
  );
}

// Widget de KPI de Ventas
function WidgetVentasKPI({ datos }: { datos: KPIsCompletos }) {
  const ventas = datos?.ventas;
  const hoy = ventas?.hoy || { total: 0, cantidad: 0 };
  const semana = ventas?.semana || { total: 0, cantidad: 0 };
  const mes = ventas?.mes || { total: 0, cantidad: 0 };

  return (
    <Card>
      <CardHeader titulo="Ventas" />
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground-muted">Hoy</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tabular-nums">{formatearPrecio(hoy.total)}</p>
              {formatearVariacion(hoy.variacion)}
            </div>
            <p className="text-xs text-foreground-muted">{hoy.cantidad || 0} ventas</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-foreground-muted">Semana</p>
              <p className="font-medium tabular-nums">{formatearPrecio(semana.total)}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Mes</p>
              <p className="font-medium tabular-nums">{formatearPrecio(mes.total)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Widget de KPI de Compras
function WidgetComprasKPI({ datos }: { datos: KPIsCompletos }) {
  const compras = datos?.compras;
  const mes = compras?.mes || { total: 0, cantidad: 0 };

  return (
    <Card>
      <CardHeader titulo="Compras del mes" />
      <CardContent>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tabular-nums">{formatearPrecio(mes.total)}</p>
          {formatearVariacion(mes.variacion)}
        </div>
        <p className="text-sm text-foreground-muted">{mes.cantidad || 0} compras</p>
      </CardContent>
    </Card>
  );
}

// Widget de KPI de Inventario
function WidgetInventarioKPI({ datos }: { datos: KPIsCompletos }) {
  const inventario = datos?.inventario || { productosActivos: 0, productosBajoMinimo: 0, productosSinStock: 0, valorEstimado: 0 };

  return (
    <Card>
      <CardHeader titulo="Inventario" descripcion={`${inventario.productosActivos || 0} productos activos`} />
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Con stock bajo</span>
            <span className={`font-medium tabular-nums ${(inventario.productosBajoMinimo || 0) > 0 ? 'text-warning' : ''}`}>
              {inventario.productosBajoMinimo || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Sin stock</span>
            <span className={`font-medium tabular-nums ${(inventario.productosSinStock || 0) > 0 ? 'text-danger' : ''}`}>
              {inventario.productosSinStock || 0}
            </span>
          </div>
          {(inventario.valorEstimado || 0) > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-foreground-muted">Valor estimado</span>
              <span className="font-medium tabular-nums">{formatearPrecio(inventario.valorEstimado)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Widget de KPI de Contactos
function WidgetContactosKPI({ datos }: { datos: KPIsCompletos }) {
  const contactos = datos?.contactos || { clientesActivos: 0, proveedoresActivos: 0, nuevosEsteMes: 0 };

  return (
    <Card>
      <CardHeader titulo="Contactos" />
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Clientes activos</span>
            <span className="font-medium tabular-nums">{contactos.clientesActivos || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Proveedores activos</span>
            <span className="font-medium tabular-nums">{contactos.proveedoresActivos || 0}</span>
          </div>
          {(contactos.nuevosEsteMes || 0) > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-foreground-muted">Nuevos este mes</span>
              <span className="font-medium tabular-nums text-success">+{contactos.nuevosEsteMes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Widget de Alertas de Inventario
function WidgetAlertasInventario({ datos }: { datos: KPIsCompletos }) {
  const alertas = datos?.alertasInventario || [];

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader titulo="Alertas de stock" />
        <CardContent>
          <p className="text-foreground-muted text-sm py-4 text-center">Sin alertas de stock</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader titulo="Alertas de stock" descripcion={`${alertas.length} productos`} />
      <CardContent>
        <ul className="space-y-2">
          {alertas.slice(0, 5).map((alerta) => (
            <li key={alerta.id} className="flex justify-between items-center text-sm">
              <span className="truncate text-foreground-muted">{alerta.nombre}</span>
              <span className={`tabular-nums ml-2 ${alerta.stock === 0 ? 'text-danger' : 'text-warning'}`}>
                {alerta.stock} / {alerta.stockMinimo}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Widget de Últimas Ventas
function WidgetUltimasVentas({ datos }: { datos: KPIsCompletos }) {
  const ventas = datos?.ultimasVentas || [];

  if (ventas.length === 0) {
    return (
      <Card>
        <CardHeader titulo="Últimas ventas" />
        <CardContent>
          <p className="text-foreground-muted text-sm py-4 text-center">Sin ventas recientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader titulo="Últimas ventas" />
      <CardContent>
        <ul className="space-y-2">
          {ventas.slice(0, 5).map((venta) => (
            <li key={venta.id} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">#{venta.numero.toString().padStart(4, '0')}</span>
                {venta.cliente && <span className="text-foreground-muted ml-2">{venta.cliente}</span>}
              </div>
              <span className="font-medium tabular-nums">{formatearPrecio(venta.total)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Widget de Últimas Compras
function WidgetUltimasCompras({ datos }: { datos: KPIsCompletos }) {
  const compras = datos?.ultimasCompras || [];

  if (compras.length === 0) {
    return (
      <Card>
        <CardHeader titulo="Últimas compras" />
        <CardContent>
          <p className="text-foreground-muted text-sm py-4 text-center">Sin compras recientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader titulo="Últimas compras" />
      <CardContent>
        <ul className="space-y-2">
          {compras.slice(0, 5).map((compra) => (
            <li key={compra.id} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">#{compra.numero.toString().padStart(4, '0')}</span>
                {compra.proveedor && <span className="text-foreground-muted ml-2">{compra.proveedor}</span>}
              </div>
              <span className="font-medium tabular-nums">{formatearPrecio(compra.total)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Widget de Top Clientes
function WidgetTopClientes({ datos }: { datos: KPIsCompletos }) {
  const clientes = datos?.topClientes || [];

  if (clientes.length === 0) {
    return (
      <Card>
        <CardHeader titulo="Mejores clientes" />
        <CardContent>
          <p className="text-foreground-muted text-sm py-4 text-center">Sin ventas este mes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader titulo="Mejores clientes" descripcion="Por total de compras" />
      <CardContent>
        <ul className="space-y-3">
          {clientes.slice(0, 5).map((cliente, index) => (
            <li key={cliente.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="truncate">{cliente.nombre}</span>
              </div>
              <span className="font-medium tabular-nums">{formatearPrecio(cliente.totalCompras)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Widget de Top Productos
function WidgetTopProductos({ datos }: { datos: KPIsCompletos }) {
  const productos = datos?.topProductos || [];

  if (productos.length === 0) {
    return (
      <Card>
        <CardHeader titulo="Productos más vendidos" />
        <CardContent>
          <p className="text-foreground-muted text-sm py-4 text-center">Sin ventas este mes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader titulo="Productos más vendidos" descripcion="Por cantidad vendida" />
      <CardContent>
        <ul className="space-y-3">
          {productos.slice(0, 5).map((producto, index) => (
            <li key={producto.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-success/10 text-success text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="truncate">{producto.nombre}</span>
              </div>
              <span className="font-medium tabular-nums">{producto.cantidadVendida} uds</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Widget de Gráfico de Ventas 30 días (simplificado - barras)
function WidgetGraficoVentas30D({ datos }: { datos: KPIsCompletos }) {
  const grafico = datos?.graficoVentas30D || [];

  if (grafico.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader titulo="Ventas últimos 30 días" />
        <CardContent>
          <p className="text-foreground-muted text-sm py-4 text-center">Sin datos</p>
        </CardContent>
      </Card>
    );
  }

  const maxTotal = Math.max(...grafico.map(d => d.total));

  return (
    <Card className="col-span-2">
      <CardHeader titulo="Ventas últimos 30 días" />
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {grafico.map((dia, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors group relative"
              style={{ height: `${maxTotal > 0 ? (dia.total / maxTotal) * 100 : 0}%`, minHeight: '2px' }}
              title={`${new Date(dia.fecha).toLocaleDateString('es-CL')}: ${formatearPrecio(dia.total)}`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {formatearPrecio(dia.total)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-foreground-muted">
          <span>{new Date(grafico[0].fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</span>
          <span>{new Date(grafico[grafico.length - 1].fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Widget principal
export function Widget({ tipo, datos, cargando }: WidgetProps) {
  if (cargando || !datos) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-4 bg-background-subtle rounded w-1/2"></div>
            <div className="h-8 bg-background-subtle rounded w-3/4"></div>
            <div className="h-3 bg-background-subtle rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (tipo) {
    case 'VENTAS_KPI':
      return <WidgetVentasKPI datos={datos} />;
    case 'COMPRAS_KPI':
      return <WidgetComprasKPI datos={datos} />;
    case 'INVENTARIO_KPI':
      return <WidgetInventarioKPI datos={datos} />;
    case 'CONTACTOS_KPI':
      return <WidgetContactosKPI datos={datos} />;
    case 'ALERTAS_INVENTARIO':
      return <WidgetAlertasInventario datos={datos} />;
    case 'ULTIMAS_VENTAS':
      return <WidgetUltimasVentas datos={datos} />;
    case 'ULTIMAS_COMPRAS':
      return <WidgetUltimasCompras datos={datos} />;
    case 'TOP_CLIENTES':
      return <WidgetTopClientes datos={datos} />;
    case 'TOP_PRODUCTOS':
      return <WidgetTopProductos datos={datos} />;
    case 'GRAFICO_VENTAS_30D':
      return <WidgetGraficoVentas30D datos={datos} />;
    default:
      return null;
  }
}

export default Widget;
