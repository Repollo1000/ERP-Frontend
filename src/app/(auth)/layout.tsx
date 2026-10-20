export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Imagen de fondo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(31, 78, 95, 0.85), rgba(17, 44, 54, 0.95)),
            url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`
        }}
      >
        <div className="flex flex-col justify-center px-12 xl:px-20 text-white relative z-10">
          <h1 className="text-5xl xl:text-6xl font-light italic mb-6">
            Bienvenido<br />de vuelta
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Gestiona tu empresa de forma simple y eficiente.
            Control de inventario, ventas, compras y más en un solo lugar.
          </p>

          {/* Decoración */}
          <div className="mt-12 flex items-center gap-6">
            <div className="w-12 h-0.5 bg-white/40"></div>
            <span className="text-white/60 text-sm">ERP Chile</span>
          </div>
        </div>

        {/* Gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
