import { Button } from './Button';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  className?: string;
}

export function Paginacion({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  className = '',
}: PaginacionProps) {
  if (totalPaginas <= 1) {
    return null;
  }

  const puedeRetroceder = paginaActual > 0;
  const puedeAvanzar = paginaActual < totalPaginas - 1;

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Button
        variante="secondary"
        tamaño="sm"
        disabled={!puedeRetroceder}
        onClick={() => onCambiarPagina(paginaActual - 1)}
        aria-label="Página anterior"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Anterior
      </Button>

      <span className="text-sm text-foreground-muted">
        Página {paginaActual + 1} de {totalPaginas}
      </span>

      <Button
        variante="secondary"
        tamaño="sm"
        disabled={!puedeAvanzar}
        onClick={() => onCambiarPagina(paginaActual + 1)}
        aria-label="Página siguiente"
      >
        Siguiente
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  );
}

export default Paginacion;
