'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

export interface FiltroOpcion {
  valor: string;
  etiqueta: string;
}

export interface FiltroConfig {
  id: string;
  etiqueta: string;
  opciones: FiltroOpcion[];
  valor: string;
  onChange: (valor: string) => void;
}

interface TablaToolbarProps {
  // Búsqueda
  busqueda?: string;
  onBusquedaChange?: (valor: string) => void;
  placeholderBusqueda?: string;

  // Filtros
  filtros?: FiltroConfig[];

  // Exportar
  onExportarExcel?: () => void;
  onExportarCSV?: () => void;

  // Cantidad de resultados
  totalResultados?: number;

  // Extras
  children?: React.ReactNode;
}

export function TablaToolbar({
  busqueda,
  onBusquedaChange,
  placeholderBusqueda = 'Buscar...',
  filtros = [],
  onExportarExcel,
  onExportarCSV,
  totalResultados,
  children,
}: TablaToolbarProps) {
  const [menuExportarAbierto, setMenuExportarAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuExportarAbierto(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hayFiltrosActivos = filtros.some(f => f.valor !== '' && f.valor !== 'todos');

  return (
    <div className="space-y-4">
      {/* Fila principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        {onBusquedaChange && (
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder={placeholderBusqueda}
              className="
                w-full pl-10 pr-4 py-2.5 rounded-lg
                bg-background border border-border
                text-foreground placeholder-foreground-muted
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all duration-200
              "
            />
            {busqueda && (
              <button
                onClick={() => onBusquedaChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {filtros.map((filtro) => (
            <select
              key={filtro.id}
              value={filtro.valor}
              onChange={(e) => filtro.onChange(e.target.value)}
              className="
                px-3 py-2.5 rounded-lg
                bg-background border border-border
                text-foreground text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all duration-200
                cursor-pointer
              "
            >
              <option value="">{filtro.etiqueta}</option>
              {filtro.opciones.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          ))}

          {/* Limpiar filtros */}
          {hayFiltrosActivos && (
            <button
              onClick={() => filtros.forEach(f => f.onChange(''))}
              className="
                px-3 py-2 rounded-lg text-sm
                text-primary hover:bg-primary/10
                transition-colors duration-200
                flex items-center gap-1
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Extras */}
        {children}

        {/* Exportar */}
        {(onExportarExcel || onExportarCSV) && (
          <div className="relative" ref={menuRef}>
            <Button
              variante="secondary"
              onClick={() => setMenuExportarAbierto(!menuExportarAbierto)}
              className="gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar
              <svg className={`w-4 h-4 transition-transform ${menuExportarAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {/* Dropdown */}
            {menuExportarAbierto && (
              <div className="
                absolute right-0 top-full mt-1 z-20
                bg-background border border-border rounded-lg shadow-lg
                py-1 min-w-[160px]
                animate-fadeIn
              ">
                {onExportarExcel && (
                  <button
                    onClick={() => {
                      onExportarExcel();
                      setMenuExportarAbierto(false);
                    }}
                    className="
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-background-subtle
                      flex items-center gap-3
                      transition-colors
                    "
                  >
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 17v-1h2v-2H8v-1h3v4H8zm5 0v-4h2v1h-1v2h1v1h-2zm3 0v-4h1c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1h-1z"/>
                    </svg>
                    Excel (.xls)
                  </button>
                )}
                {onExportarCSV && (
                  <button
                    onClick={() => {
                      onExportarCSV();
                      setMenuExportarAbierto(false);
                    }}
                    className="
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-background-subtle
                      flex items-center gap-3
                      transition-colors
                    "
                  >
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 13h2v2H7v-2zm0 4h2v2H7v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                    </svg>
                    CSV
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info de resultados */}
      {totalResultados !== undefined && (
        <div className="text-sm text-foreground-muted">
          {totalResultados === 0
            ? 'No se encontraron resultados'
            : `${totalResultados} ${totalResultados === 1 ? 'resultado' : 'resultados'}`
          }
          {(busqueda || hayFiltrosActivos) && ' con los filtros aplicados'}
        </div>
      )}
    </div>
  );
}

export default TablaToolbar;
