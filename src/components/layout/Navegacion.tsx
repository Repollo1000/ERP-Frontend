'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, ThemeToggle } from '@/components/ui';

const enlaces = [
  { href: '/', etiqueta: 'Inicio', icono: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/productos', etiqueta: 'Productos', icono: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/contactos', etiqueta: 'Contactos', icono: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/ventas', etiqueta: 'Ventas', icono: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { href: '/compras', etiqueta: 'Compras', icono: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { href: '/inventario', etiqueta: 'Inventario', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
];

export function Navegacion() {
  const pathname = usePathname();
  const { usuario, logout, cargando } = useAuth();
  const [menuModoAbierto, setMenuModoAbierto] = useState(false);
  const menuModoRef = useRef<HTMLDivElement>(null);

  // Detectar si estamos en modo CRM
  const esCRM = pathname.startsWith('/crm');

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuModoRef.current && !menuModoRef.current.contains(event.target as Node)) {
        setMenuModoAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-nav-bg border-b border-nav-border sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y selector de modo */}
          <div className="flex items-center gap-8">
            <div className="relative" ref={menuModoRef}>
              <button
                onClick={() => setMenuModoAbierto(!menuModoAbierto)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg
                  border transition-all duration-200 group
                  ${esCRM
                    ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/10'
                    : 'bg-gradient-to-r from-primary/10 to-transparent border-primary/20 hover:border-primary/40 hover:bg-primary/10'
                  }
                `}
                title={esCRM ? 'Valdotain CRM' : 'Valdotain ERP'}
              >
                {/* Icono del nudo Valdotain estilizado */}
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shadow-sm ${esCRM ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-primary'}`}>
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 4C8 4 6 7 6 10c0 2 1 3.5 3 4.5" />
                    <path d="M12 4c4 0 6 3 6 6c0 2-1 3.5-3 4.5" />
                    <path d="M9 14.5c-2 1-3 2.5-3 4.5c0 0 2 1 6 1s6-1 6-1c0-2-1-3.5-3-4.5" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>

                {/* Nombre del proyecto */}
                <span className="font-bold text-foreground tracking-tight">
                  Valdotain
                </span>

                {/* Badge ERP/CRM */}
                <span className={`
                  px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                  text-white shadow-sm
                  ${esCRM ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-primary'}
                `}>
                  {esCRM ? 'CRM' : 'ERP'}
                </span>

                {/* Flecha */}
                <svg
                  className={`w-3.5 h-3.5 text-foreground-muted group-hover:text-foreground transition-all hidden sm:block ${menuModoAbierto ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown de modos */}
              {menuModoAbierto && (
                <div className="
                  absolute left-0 top-full mt-2 z-50
                  bg-background border border-border rounded-xl shadow-xl
                  py-2 min-w-[200px]
                  animate-fadeIn
                ">
                  {/* Opción ERP */}
                  <Link
                    href="/"
                    onClick={() => setMenuModoAbierto(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      hover:bg-background-subtle transition-colors
                      ${!esCRM ? 'bg-primary/5' : ''}
                    `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">ERP</span>
                        {!esCRM && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-muted">Gestión empresarial</p>
                    </div>
                  </Link>

                  <div className="border-t border-border my-1" />

                  {/* Opción CRM */}
                  <Link
                    href="/crm"
                    onClick={() => setMenuModoAbierto(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      hover:bg-background-subtle transition-colors
                      ${esCRM ? 'bg-orange-500/5' : ''}
                    `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">CRM</span>
                        {esCRM && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded font-medium">
                            Actual
                          </span>
                        )}
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">
                          Próximamente
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted">Relaciones con clientes</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Enlaces de navegación */}
            <nav className="hidden lg:flex items-center gap-1">
              {enlaces.map((enlace) => {
                const activo = pathname === enlace.href;
                return (
                  <Link
                    key={enlace.href}
                    href={enlace.href}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-[var(--radius)]
                      transition-colors duration-150
                      ${
                        activo
                          ? 'bg-primary text-white'
                          : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={enlace.icono} />
                    </svg>
                    {enlace.etiqueta}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {/* Toggle de tema */}
            <ThemeToggle />

            {usuario?.empresaActiva && (
              <>
                {/* Selector de empresa (si hay múltiples) */}
                {usuario.empresas.length > 1 && (
                  <div className="hidden md:block">
                    <span className="text-xs text-foreground-muted bg-background-subtle px-2 py-1 rounded-full">
                      +{usuario.empresas.length - 1} empresas
                    </span>
                  </div>
                )}

                {/* Mi Cuenta */}
                <Link
                  href="/cuenta"
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-[var(--radius)]
                    transition-colors duration-150
                    ${
                      pathname === '/cuenta'
                        ? 'bg-primary text-white'
                        : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Mi Cuenta</span>
                </Link>

                {/* Cerrar sesión */}
                <Button
                  variante="ghost"
                  tamaño="sm"
                  onClick={logout}
                  disabled={cargando}
                  className="text-foreground-muted hover:text-danger"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <nav className="lg:hidden border-t border-border px-2 py-2 flex gap-1 overflow-x-auto bg-background-subtle">
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href;
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--radius)] whitespace-nowrap
                transition-colors
                ${
                  activo
                    ? 'bg-primary text-white'
                    : 'text-foreground-muted hover:bg-background'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={enlace.icono} />
              </svg>
              {enlace.etiqueta}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default Navegacion;
