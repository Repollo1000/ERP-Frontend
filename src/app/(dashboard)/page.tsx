'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precio);
}

export default function InicioPage() {
  const { usuario } = useAuth();
  const { resumen, cargando, error } = useDashboard();

  if (!usuario?.empresaActiva) {
    // El layout ya maneja la redirección, mostrar loading mientras tanto
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const esAdmin = usuario.empresaActiva.rol === 'ADMINISTRADOR';

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
        <Badge variante={esAdmin ? 'info' : 'default'}>
          {esAdmin ? 'Administrador' : 'Usuario'}
        </Badge>
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
      ) : resumen ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader titulo="Ventas del día" />
              <CardContent>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {formatearPrecio(resumen.ventas.totalHoy)}
                </p>
                <p className="text-sm text-foreground-muted">
                  {resumen.ventas.cantidadHoy} {resumen.ventas.cantidadHoy === 1 ? 'venta' : 'ventas'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader titulo="Ventas del mes" />
              <CardContent>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {formatearPrecio(resumen.ventas.totalMes)}
                </p>
                <p className="text-sm text-foreground-muted">
                  {resumen.ventas.cantidadMes} {resumen.ventas.cantidadMes === 1 ? 'venta' : 'ventas'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader titulo="Compras del mes" />
              <CardContent>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {formatearPrecio(resumen.compras.totalMes)}
                </p>
                <p className="text-sm text-foreground-muted">
                  {resumen.compras.cantidadMes} {resumen.compras.cantidadMes === 1 ? 'compra' : 'compras'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader
                titulo="Inventario"
                descripcion={`${resumen.inventario.productosActivos} productos activos`}
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Con stock bajo</span>
                    <span className={`font-medium tabular-nums ${resumen.inventario.productosBajoMinimo > 0 ? 'text-warning' : ''}`}>
                      {resumen.inventario.productosBajoMinimo}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Sin stock</span>
                    <span className={`font-medium tabular-nums ${resumen.inventario.productosSinStock > 0 ? 'text-danger' : ''}`}>
                      {resumen.inventario.productosSinStock}
                    </span>
                  </div>

                  {resumen.inventario.alertas.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm font-medium mb-2">Alertas de stock</p>
                      <ul className="space-y-1 text-sm">
                        {resumen.inventario.alertas.slice(0, 5).map((alerta) => (
                          <li key={alerta.id} className="flex justify-between text-foreground-muted">
                            <span className="truncate">{alerta.nombre}</span>
                            <span className="text-warning tabular-nums ml-2">
                              {alerta.stock} / {alerta.stockMinimo}
                            </span>
                          </li>
                        ))}
                        {resumen.inventario.alertas.length > 5 && (
                          <li>
                            <Link href="/inventario" className="text-primary hover:underline">
                              Ver todos ({resumen.inventario.alertas.length})
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                titulo="Mejores clientes"
                descripcion="Por total de compras este mes"
              />
              <CardContent>
                {resumen.topClientes.length === 0 ? (
                  <p className="text-foreground-muted text-sm py-4 text-center">
                    Sin ventas este mes
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {resumen.topClientes.map((cliente, index) => (
                      <li key={cliente.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="truncate">{cliente.nombre}</span>
                        </div>
                        <span className="font-medium tabular-nums">
                          {formatearPrecio(cliente.totalCompras)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
