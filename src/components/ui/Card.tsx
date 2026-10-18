import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const estilosPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-background
        border border-border
        rounded-[var(--radius-lg)]
        shadow-sm
        ${estilosPadding[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function CardHeader({ titulo, descripcion, accion }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
        {descripcion && (
          <p className="text-sm text-foreground-muted mt-0.5">{descripcion}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        flex items-center justify-end gap-3
        pt-4 mt-4
        border-t border-border
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
