'use client';

export default function CRMPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Contenedor principal con tema naranja */}
      <div className="
        relative max-w-lg w-full
        bg-gradient-to-br from-orange-50 to-amber-50
        dark:from-orange-950/30 dark:to-amber-950/20
        border-2 border-orange-200 dark:border-orange-800/50
        rounded-2xl p-8 sm:p-12
        shadow-xl shadow-orange-100 dark:shadow-orange-900/20
        text-center
      ">
        {/* Decoración superior */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 rounded-full">
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            Próximamente
          </span>
        </div>

        {/* Icono de construcción */}
        <div className="
          w-20 h-20 mx-auto mb-6
          bg-gradient-to-br from-orange-400 to-amber-500
          rounded-2xl rotate-3
          flex items-center justify-center
          shadow-lg shadow-orange-200 dark:shadow-orange-900/30
        ">
          <svg
            className="w-10 h-10 text-white -rotate-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            {/* Icono de herramientas/construcción */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
            />
          </svg>
        </div>

        {/* Logo Valdotain CRM */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Valdotain
          </span>
          <span className="
            px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
            bg-gradient-to-r from-orange-500 to-amber-500
            text-white shadow-sm
          ">
            CRM
          </span>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          En Construcción
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Estamos trabajando para traerte la mejor herramienta de gestión de relaciones con clientes.
        </p>

        {/* Características próximas */}
        <div className="
          bg-white/60 dark:bg-gray-900/40
          rounded-xl p-4 mb-6
          border border-orange-100 dark:border-orange-900/30
        ">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
            Próximas funcionalidades:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Pipeline de ventas visual
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Seguimiento de oportunidades
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Automatización de tareas
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Reportes y analíticas
            </li>
          </ul>
        </div>

        {/* Botón para volver */}
        <a
          href="/"
          className="
            inline-flex items-center gap-2
            px-5 py-2.5 rounded-lg
            bg-gradient-to-r from-orange-500 to-amber-500
            hover:from-orange-600 hover:to-amber-600
            text-white font-medium
            shadow-md shadow-orange-200 dark:shadow-orange-900/30
            hover:shadow-lg
            transition-all duration-200
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al ERP
        </a>

        {/* Decoración de fondo */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
