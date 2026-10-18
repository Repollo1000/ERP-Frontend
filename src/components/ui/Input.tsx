import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
  iconoIzquierda?: ReactNode;
  iconoDerecha?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      etiqueta,
      error,
      ayuda,
      iconoIzquierda,
      iconoDerecha,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const tieneError = !!error;

    return (
      <div className="w-full">
        {etiqueta && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {etiqueta}
            {props.required && (
              <span className="text-danger ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {iconoIzquierda && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground-muted">
              {iconoIzquierda}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={tieneError}
            aria-describedby={
              error ? `${inputId}-error` : ayuda ? `${inputId}-ayuda` : undefined
            }
            className={`
              w-full px-3 py-2
              bg-background text-foreground
              border rounded-[var(--radius)]
              placeholder:text-foreground-muted
              transition-colors duration-150
              disabled:bg-background-subtle disabled:cursor-not-allowed disabled:opacity-60
              ${iconoIzquierda ? 'pl-10' : ''}
              ${iconoDerecha ? 'pr-10' : ''}
              ${
                tieneError
                  ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus'
              }
              ${className}
            `}
            {...props}
          />

          {iconoDerecha && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-foreground-muted">
              {iconoDerecha}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        {ayuda && !error && (
          <p
            id={`${inputId}-ayuda`}
            className="mt-1.5 text-sm text-foreground-muted"
          >
            {ayuda}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
