type Tamaño = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  tamaño?: Tamaño;
  className?: string;
}

const estilosTamaño: Record<Tamaño, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ tamaño = 'md', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin text-primary ${estilosTamaño[tamaño]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Cargando"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// Spinner de página completa
export function SpinnerPagina({ mensaje }: { mensaje?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <Spinner tamaño="lg" />
      {mensaje && (
        <p className="text-sm text-foreground-muted">{mensaje}</p>
      )}
    </div>
  );
}

export default Spinner;
