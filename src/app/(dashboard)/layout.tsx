'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navegacion } from '@/components/layout/Navegacion';
import { SpinnerPagina } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { usuario, cargando, estadoLogin } = useAuth();

  useEffect(() => {
    if (cargando) return;

    // No autenticado → login
    if (!usuario) {
      router.push('/login');
      return;
    }

    // Autenticado pero sin empresa → login (para seleccionar empresa)
    if (!usuario.empresaActiva) {
      router.push('/login');
      return;
    }
  }, [usuario, cargando, estadoLogin, router]);

  // Siempre renderizar children para evitar error de instant navigation
  // Mostrar overlay de loading cuando no está listo
  const mostrarOverlay = cargando || !usuario || !usuario.empresaActiva;

  return (
    <div className="min-h-screen flex flex-col">
      {mostrarOverlay ? (
        <SpinnerPagina mensaje={cargando ? 'Cargando...' : 'Redirigiendo...'} />
      ) : (
        <Navegacion />
      )}
      <main
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ display: mostrarOverlay ? 'none' : undefined }}
      >
        {children}
      </main>
    </div>
  );
}
