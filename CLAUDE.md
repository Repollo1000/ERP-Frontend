# CLAUDE.md

## Proyecto
Frontend del ERP gratuito y de código abierto para pequeñas empresas de Chile.
Repositorio separado del backend.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod (formularios/validación) — por agregar
- SWR o TanStack Query (data fetching) — por agregar
- Deploy en Vercel

## Backend (repo separado)
- Repositorio: `/Users/sebastian/Documents/ERP`
- Stack: Spring Boot 4.1, Java 25, PostgreSQL
- API REST en `/api/*` (endpoints JSON)
- Autenticación: JWT (por implementar, actualmente usa sesiones)
- Deploy: homelab con Cloudflare Tunnel

## Arquitectura
```
Frontend (Vercel) ←── HTTPS/JSON ──→ Backend (Homelab)
```

## Módulos del backend a consumir
- Autenticación (login, 2FA)
- Productos
- Contactos (clientes/proveedores)
- Ventas (con carrito)
- Compras (con carrito)
- Inventario (kardex)

## Estructura del proyecto
```
src/
├── app/              # App Router (páginas y layouts)
├── components/       # Componentes reutilizables (por crear)
├── lib/              # Utilidades, API client (por crear)
└── types/            # Tipos TypeScript (por crear)
```

## Variables de entorno
```env
NEXT_PUBLIC_API_URL=http://localhost:8080  # URL del backend
```

## Comandos
```bash
npm run dev      # Desarrollo (http://localhost:3000)
npm run build    # Build de producción
npm run start    # Iniciar build de producción
npm run lint     # Ejecutar ESLint
```

## Reglas de desarrollo
1. Componentes en español (nombres de variables, comentarios)
2. Tipos estrictos — evitar `any`
3. Manejo de errores en todas las llamadas a la API
4. Loading states y feedback visual al usuario
5. Responsive design (mobile-first)
6. Accesibilidad básica (labels, roles, contraste)

## Seguridad
- Nunca almacenar tokens en localStorage (usar httpOnly cookies o memoria)
- Validar datos en frontend Y backend
- Sanitizar inputs para prevenir XSS
- CSRF: manejado por el backend con tokens

## Contexto de negocio
- Multi-tenant: cada empresa ve solo sus datos
- Privacidad: cumplimiento Ley 21.719 Chile
- Usuarios tienen roles (administrador, usuario)
- Dinero siempre con precisión decimal (nunca float)

## Pendiente por implementar
- [ ] Configuración de API client con interceptores
- [ ] Manejo de autenticación (JWT + refresh)
- [ ] Layout principal con navegación
- [ ] Página de login
- [ ] Sistema de diseño básico (colores, tipografía, componentes)
