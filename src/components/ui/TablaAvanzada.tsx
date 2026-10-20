'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from './Button';

// ============================================
// Types
// ============================================

export interface ColumnaConfig<T> {
  id: string;
  titulo: string;
  campo: keyof T | ((item: T) => React.ReactNode);
  ordenable?: boolean;
  alineacion?: 'left' | 'center' | 'right';
  ancho?: string;
  visible?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface AccionMasiva<T> {
  id: string;
  etiqueta: string;
  icono?: React.ReactNode;
  variante?: 'primary' | 'danger' | 'secondary';
  onEjecutar: (items: T[]) => void | Promise<void>;
  confirmar?: string; // Mensaje de confirmación
}

export interface VistaGuardada {
  id: string;
  nombre: string;
  columnas: string[]; // IDs de columnas visibles
  ordenPor?: string;
  ordenDir?: 'asc' | 'desc';
  filtros?: Record<string, string>;
}

interface TablaAvanzadaProps<T> {
  // Datos
  datos: T[];
  columnas: ColumnaConfig<T>[];
  keyField: keyof T;

  // Selección
  seleccionable?: boolean;
  seleccionados?: T[];
  onSeleccionChange?: (items: T[]) => void;

  // Acciones masivas
  accionesMasivas?: AccionMasiva<T>[];

  // Ordenamiento
  ordenPor?: string;
  ordenDir?: 'asc' | 'desc';
  onOrdenChange?: (campo: string, dir: 'asc' | 'desc') => void;

  // Columnas
  columnasVisibles?: string[];
  onColumnasChange?: (columnas: string[]) => void;

  // Clic en fila
  onFilaClick?: (item: T) => void;

  // Densidad
  densidad?: 'compacta' | 'normal' | 'espaciada';

  // Vistas guardadas
  vistas?: VistaGuardada[];
  vistaActual?: string;
  onVistaChange?: (vistaId: string | null) => void;
  onVistaGuardar?: (vista: Omit<VistaGuardada, 'id'>) => void;

  // Storage key para persistir preferencias
  storageKey?: string;

  // Estado vacío
  mensajeVacio?: string;
  iconoVacio?: React.ReactNode;
}

// ============================================
// Component
// ============================================

export function TablaAvanzada<T extends object>({
  datos,
  columnas: columnasConfig,
  keyField,
  seleccionable = false,
  seleccionados = [],
  onSeleccionChange,
  accionesMasivas = [],
  ordenPor: ordenPorProp,
  ordenDir: ordenDirProp,
  onOrdenChange,
  columnasVisibles: columnasVisiblesProp,
  onColumnasChange,
  onFilaClick,
  densidad = 'normal',
  vistas = [],
  vistaActual,
  onVistaChange,
  onVistaGuardar,
  storageKey,
  mensajeVacio = 'No hay datos',
  iconoVacio,
}: TablaAvanzadaProps<T>) {
  // Estado local
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const [menuVistasAbierto, setMenuVistasAbierto] = useState(false);
  const [nombreNuevaVista, setNombreNuevaVista] = useState('');
  const [mostrarGuardarVista, setMostrarGuardarVista] = useState(false);

  const menuColumnasRef = useRef<HTMLDivElement>(null);
  const menuVistasRef = useRef<HTMLDivElement>(null);

  // Ordenamiento local si no se controla externamente
  const [ordenLocal, setOrdenLocal] = useState<{ campo: string; dir: 'asc' | 'desc' } | null>(null);
  const ordenPor = ordenPorProp ?? ordenLocal?.campo;
  const ordenDir = ordenDirProp ?? ordenLocal?.dir ?? 'asc';

  // Columnas visibles (local o controlado)
  const [columnasVisiblesLocal, setColumnasVisiblesLocal] = useState<string[]>(
    columnasConfig.filter(c => c.visible !== false).map(c => c.id)
  );
  const columnasVisibles = columnasVisiblesProp ?? columnasVisiblesLocal;

  // Cargar preferencias del localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`tabla_${storageKey}`);
        if (saved) {
          const prefs = JSON.parse(saved);
          if (prefs.columnasVisibles) {
            setColumnasVisiblesLocal(prefs.columnasVisibles);
          }
          if (prefs.orden) {
            setOrdenLocal(prefs.orden);
          }
        }
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, [storageKey]);

  // Guardar preferencias
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`tabla_${storageKey}`, JSON.stringify({
        columnasVisibles: columnasVisiblesLocal,
        orden: ordenLocal,
      }));
    }
  }, [storageKey, columnasVisiblesLocal, ordenLocal]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuColumnasRef.current && !menuColumnasRef.current.contains(event.target as Node)) {
        setMenuColumnasAbierto(false);
      }
      if (menuVistasRef.current && !menuVistasRef.current.contains(event.target as Node)) {
        setMenuVistasAbierto(false);
        setMostrarGuardarVista(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Columnas filtradas por visibilidad
  const columnas = useMemo(() => {
    return columnasConfig.filter(c => columnasVisibles.includes(c.id));
  }, [columnasConfig, columnasVisibles]);

  // Datos ordenados
  const datosOrdenados = useMemo(() => {
    if (!ordenPor) return datos;

    const columna = columnasConfig.find(c => c.id === ordenPor);
    if (!columna) return datos;

    return [...datos].sort((a, b) => {
      let valorA: unknown;
      let valorB: unknown;

      if (typeof columna.campo === 'function') {
        valorA = columna.campo(a);
        valorB = columna.campo(b);
      } else {
        valorA = a[columna.campo];
        valorB = b[columna.campo];
      }

      // Convertir a string para comparar
      const strA = String(valorA ?? '').toLowerCase();
      const strB = String(valorB ?? '').toLowerCase();

      // Intentar comparar como números si es posible
      const numA = parseFloat(strA);
      const numB = parseFloat(strB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return ordenDir === 'asc' ? numA - numB : numB - numA;
      }

      return ordenDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [datos, ordenPor, ordenDir, columnasConfig]);

  // Handlers
  const toggleColumna = (id: string) => {
    const nuevas = columnasVisibles.includes(id)
      ? columnasVisibles.filter(c => c !== id)
      : [...columnasVisibles, id];

    if (onColumnasChange) {
      onColumnasChange(nuevas);
    } else {
      setColumnasVisiblesLocal(nuevas);
    }
  };

  const handleOrden = (columnaId: string) => {
    const columna = columnasConfig.find(c => c.id === columnaId);
    if (!columna?.ordenable) return;

    const nuevaDir = ordenPor === columnaId && ordenDir === 'asc' ? 'desc' : 'asc';

    if (onOrdenChange) {
      onOrdenChange(columnaId, nuevaDir);
    } else {
      setOrdenLocal({ campo: columnaId, dir: nuevaDir });
    }
  };

  const toggleSeleccion = (item: T) => {
    if (!onSeleccionChange) return;

    const key = item[keyField];
    const estaSeleccionado = seleccionados.some(s => s[keyField] === key);

    if (estaSeleccionado) {
      onSeleccionChange(seleccionados.filter(s => s[keyField] !== key));
    } else {
      onSeleccionChange([...seleccionados, item]);
    }
  };

  const toggleTodos = () => {
    if (!onSeleccionChange) return;

    if (seleccionados.length === datosOrdenados.length) {
      onSeleccionChange([]);
    } else {
      onSeleccionChange([...datosOrdenados]);
    }
  };

  const guardarVista = () => {
    if (!onVistaGuardar || !nombreNuevaVista.trim()) return;

    onVistaGuardar({
      nombre: nombreNuevaVista.trim(),
      columnas: columnasVisibles,
      ordenPor,
      ordenDir,
    });

    setNombreNuevaVista('');
    setMostrarGuardarVista(false);
  };

  // Estilos de densidad
  const paddingClases = {
    compacta: 'py-1.5 px-2',
    normal: 'py-3 px-3',
    espaciada: 'py-4 px-4',
  };

  const todosSeleccionados = seleccionados.length === datosOrdenados.length && datosOrdenados.length > 0;
  const algunosSeleccionados = seleccionados.length > 0 && seleccionados.length < datosOrdenados.length;

  return (
    <div className="space-y-3">
      {/* Toolbar de configuración */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Acciones masivas */}
        {seleccionable && seleccionados.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium text-primary">
              {seleccionados.length} seleccionado{seleccionados.length !== 1 ? 's' : ''}
            </span>
            <div className="h-4 w-px bg-primary/30" />
            {accionesMasivas.map((accion) => (
              <button
                key={accion.id}
                onClick={async () => {
                  if (accion.confirmar) {
                    if (!confirm(accion.confirmar)) return;
                  }
                  await accion.onEjecutar(seleccionados);
                }}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium
                  transition-colors
                  ${accion.variante === 'danger'
                    ? 'text-red-600 hover:bg-red-100'
                    : accion.variante === 'primary'
                      ? 'text-primary hover:bg-primary/20'
                      : 'text-foreground-muted hover:bg-background-subtle'
                  }
                `}
              >
                {accion.icono}
                {accion.etiqueta}
              </button>
            ))}
            <button
              onClick={() => onSeleccionChange?.([])}
              className="text-foreground-muted hover:text-foreground text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Vistas guardadas */}
        {(vistas.length > 0 || onVistaGuardar) && (
          <div className="relative" ref={menuVistasRef}>
            <button
              onClick={() => setMenuVistasAbierto(!menuVistasAbierto)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-background-subtle transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {vistaActual ? vistas.find(v => v.id === vistaActual)?.nombre : 'Vistas'}
              <svg className={`w-4 h-4 transition-transform ${menuVistasAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuVistasAbierto && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[200px]">
                {vistas.map((vista) => (
                  <button
                    key={vista.id}
                    onClick={() => {
                      onVistaChange?.(vista.id);
                      setMenuVistasAbierto(false);
                    }}
                    className={`
                      w-full px-4 py-2 text-left text-sm hover:bg-background-subtle
                      flex items-center justify-between
                      ${vistaActual === vista.id ? 'bg-primary/10 text-primary' : ''}
                    `}
                  >
                    {vista.nombre}
                    {vistaActual === vista.id && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}

                {vistas.length > 0 && vistaActual && (
                  <button
                    onClick={() => {
                      onVistaChange?.(null);
                      setMenuVistasAbierto(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground-muted hover:bg-background-subtle border-t border-border"
                  >
                    Restablecer vista
                  </button>
                )}

                {onVistaGuardar && (
                  <>
                    <div className="border-t border-border my-1" />
                    {mostrarGuardarVista ? (
                      <div className="px-3 py-2 space-y-2">
                        <input
                          type="text"
                          value={nombreNuevaVista}
                          onChange={(e) => setNombreNuevaVista(e.target.value)}
                          placeholder="Nombre de la vista"
                          className="w-full px-2 py-1 text-sm border border-border rounded"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') guardarVista();
                            if (e.key === 'Escape') setMostrarGuardarVista(false);
                          }}
                        />
                        <div className="flex gap-2">
                          <Button tamaño="sm" onClick={guardarVista} disabled={!nombreNuevaVista.trim()}>
                            Guardar
                          </Button>
                          <Button tamaño="sm" variante="ghost" onClick={() => setMostrarGuardarVista(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMostrarGuardarVista(true)}
                        className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background-subtle flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Guardar vista actual
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Columnas */}
        <div className="relative" ref={menuColumnasRef}>
          <button
            onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-background-subtle transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Columnas
          </button>

          {menuColumnasAbierto && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
              <div className="px-3 pb-2 text-xs font-medium text-foreground-muted uppercase">
                Mostrar columnas
              </div>
              {columnasConfig.map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-background-subtle cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={columnasVisibles.includes(col.id)}
                    onChange={() => toggleColumna(col.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{col.titulo}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      {datosOrdenados.length === 0 ? (
        <div className="text-center py-12 text-foreground-muted">
          {iconoVacio || (
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
          <p>{mensajeVacio}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-background-subtle">
              <tr>
                {seleccionable && (
                  <th className={`${paddingClases[densidad]} w-10`}>
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      ref={(el) => {
                        if (el) el.indeterminate = algunosSeleccionados;
                      }}
                      onChange={toggleTodos}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                )}
                {columnas.map((col) => (
                  <th
                    key={col.id}
                    className={`
                      ${paddingClases[densidad]} font-medium text-foreground-muted
                      ${col.alineacion === 'center' ? 'text-center' : col.alineacion === 'right' ? 'text-right' : 'text-left'}
                      ${col.ordenable ? 'cursor-pointer hover:text-foreground select-none' : ''}
                    `}
                    style={{ width: col.ancho }}
                    onClick={() => col.ordenable && handleOrden(col.id)}
                  >
                    <div className={`flex items-center gap-1 ${col.alineacion === 'right' ? 'justify-end' : col.alineacion === 'center' ? 'justify-center' : ''}`}>
                      {col.titulo}
                      {col.ordenable && ordenPor === col.id && (
                        <svg className={`w-4 h-4 transition-transform ${ordenDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                      {col.ordenable && ordenPor !== col.id && (
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosOrdenados.map((item) => {
                const key = String(item[keyField]);
                const estaSeleccionado = seleccionados.some(s => s[keyField] === item[keyField]);

                return (
                  <tr
                    key={key}
                    className={`
                      border-t border-border transition-colors
                      ${onFilaClick ? 'cursor-pointer' : ''}
                      ${estaSeleccionado ? 'bg-primary/5' : 'hover:bg-background-subtle'}
                    `}
                    onClick={() => onFilaClick?.(item)}
                  >
                    {seleccionable && (
                      <td className={paddingClases[densidad]} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => toggleSeleccion(item)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    {columnas.map((col) => {
                      let contenido: React.ReactNode;

                      if (col.render) {
                        contenido = col.render(item);
                      } else if (typeof col.campo === 'function') {
                        contenido = col.campo(item);
                      } else {
                        contenido = String(item[col.campo] ?? '');
                      }

                      return (
                        <td
                          key={col.id}
                          className={`
                            ${paddingClases[densidad]}
                            ${col.alineacion === 'center' ? 'text-center' : col.alineacion === 'right' ? 'text-right' : 'text-left'}
                          `}
                        >
                          {contenido}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TablaAvanzada;
