import { type ReactNode } from 'react';

type TipoAlerta = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  tipo?: TipoAlerta;
  titulo?: string;
  children: ReactNode;
  className?: string;
}

const estilosTipo: Record<TipoAlerta, string> = {
  info: 'bg-primary-light border-primary text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
  success: 'bg-success-light border-success text-success-700 dark:bg-success/20 dark:text-success-200',
  warning: 'bg-warning-light border-warning text-warning-700 dark:bg-warning/20 dark:text-warning-200',
  danger: 'bg-danger-light border-danger text-danger-700 dark:bg-danger/20 dark:text-danger-200',
};

const iconos: Record<TipoAlerta, ReactNode> = {
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  danger: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

export function Alert({
  tipo = 'info',
  titulo,
  children,
  className = '',
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`
        flex gap-3 p-4
        border rounded-[var(--radius)]
        ${estilosTipo[tipo]}
        ${className}
      `}
    >
      <div className="shrink-0">{iconos[tipo]}</div>
      <div>
        {titulo && <p className="font-medium mb-1">{titulo}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

export default Alert;
