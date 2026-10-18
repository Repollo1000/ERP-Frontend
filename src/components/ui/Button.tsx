import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variante = 'primary' | 'secondary' | 'danger' | 'ghost';
type Tamaño = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamaño?: Tamaño;
  cargando?: boolean;
  icono?: ReactNode;
  iconoDerecha?: ReactNode;
}

const estilosVariante: Record<Variante, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50',
  secondary:
    'bg-background-subtle text-foreground border border-border hover:bg-gray-100 dark:hover:bg-gray-800',
  danger:
    'bg-danger text-white hover:bg-danger-700 disabled:bg-danger/50',
  ghost:
    'text-foreground hover:bg-background-subtle',
};

const estilosTamaño: Record<Tamaño, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variante = 'primary',
      tamaño = 'md',
      cargando = false,
      icono,
      iconoDerecha,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const estaDeshabilitado = disabled || cargando;

    return (
      <button
        ref={ref}
        disabled={estaDeshabilitado}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-[var(--radius)]
          transition-colors duration-150
          disabled:cursor-not-allowed disabled:opacity-60
          ${estilosVariante[variante]}
          ${estilosTamaño[tamaño]}
          ${className}
        `}
        {...props}
      >
        {cargando ? (
          <Spinner />
        ) : icono ? (
          <span className="shrink-0">{icono}</span>
        ) : null}
        {children}
        {iconoDerecha && !cargando && (
          <span className="shrink-0">{iconoDerecha}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Spinner inline para el botón
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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

export default Button;
