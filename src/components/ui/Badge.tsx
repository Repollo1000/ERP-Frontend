import { type ReactNode } from 'react';

type Variante = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variante?: Variante;
  children: ReactNode;
  className?: string;
}

const estilosVariante: Record<Variante, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-success-light text-success-700 dark:bg-success/20 dark:text-success-200',
  warning: 'bg-warning-light text-warning-700 dark:bg-warning/20 dark:text-warning-200',
  danger: 'bg-danger-light text-danger-700 dark:bg-danger/20 dark:text-danger-200',
  info: 'bg-primary-light text-primary-700 dark:bg-primary/20 dark:text-primary-200',
};

export function Badge({
  variante = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5
        text-xs font-medium
        rounded-full
        ${estilosVariante[variante]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
