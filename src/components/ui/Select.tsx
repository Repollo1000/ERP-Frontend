import { forwardRef, type SelectHTMLAttributes } from 'react';

interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
  opciones: OpcionSelect[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      etiqueta,
      error,
      ayuda,
      opciones,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;
    const tieneError = !!error;

    return (
      <div className="w-full">
        {etiqueta && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {etiqueta}
            {props.required && (
              <span className="text-danger ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          aria-invalid={tieneError}
          aria-describedby={
            error ? `${selectId}-error` : ayuda ? `${selectId}-ayuda` : undefined
          }
          className={`
            w-full px-3 py-2
            bg-background text-foreground
            border rounded-[var(--radius)]
            transition-colors duration-150
            disabled:bg-background-subtle disabled:cursor-not-allowed disabled:opacity-60
            ${
              tieneError
                ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                : 'border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>

        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1.5 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        {ayuda && !error && (
          <p
            id={`${selectId}-ayuda`}
            className="mt-1.5 text-sm text-foreground-muted"
          >
            {ayuda}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
