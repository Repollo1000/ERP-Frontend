'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const enlaces = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/productos', etiqueta: 'Productos' },
  { href: '/contactos', etiqueta: 'Contactos' },
  { href: '/ventas', etiqueta: 'Ventas' },
  { href: '/compras', etiqueta: 'Compras' },
  { href: '/inventario', etiqueta: 'Inventario' },
];

export function Navegacion() {
  const pathname = usePathname();
  const { usuario, logout, cargando } = useAuth();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl text-primary">
              ERP
            </Link>

            {/* Enlaces de navegación */}
            <nav className="hidden md:flex items-center gap-1">
              {enlaces.map((enlace) => {
                const activo = pathname === enlace.href;
                return (
                  <Link
                    key={enlace.href}
                    href={enlace.href}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-[var(--radius)]
                      transition-colors duration-150
                      ${
                        activo
                          ? 'bg-primary-light text-primary'
                          : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle'
                      }
                    `}
                  >
                    {enlace.etiqueta}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Usuario y logout */}
          <div className="flex items-center gap-4">
            {usuario?.empresaActiva && (
              <>
                <div className="hidden sm:block text-sm">
                  <span className="text-foreground-muted">
                    {usuario.empresaActiva.razonSocial}
                  </span>
                  {usuario.empresas.length > 1 && (
                    <span className="text-foreground-muted ml-1">
                      (+{usuario.empresas.length - 1})
                    </span>
                  )}
                </div>
                <Link
                  href="/cuenta"
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-[var(--radius)]
                    transition-colors duration-150
                    ${
                      pathname === '/cuenta'
                        ? 'bg-primary-light text-primary'
                        : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle'
                    }
                  `}
                >
                  Mi Cuenta
                </Link>
                <Button
                  variante="ghost"
                  tamaño="sm"
                  onClick={logout}
                  disabled={cargando}
                >
                  Salir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <nav className="md:hidden border-t border-border px-4 py-2 flex gap-2 overflow-x-auto">
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href;
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-[var(--radius)] whitespace-nowrap
                ${
                  activo
                    ? 'bg-primary-light text-primary'
                    : 'text-foreground-muted'
                }
              `}
            >
              {enlace.etiqueta}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default Navegacion;
