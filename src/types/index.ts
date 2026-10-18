// Tipos base del ERP

// ============================================
// Errores de API
// ============================================

export interface ApiError {
  error: string;
  segundosRestantes?: number;
}

export function esErrorApi(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error
  );
}

// ============================================
// Autenticación
// ============================================

// Credenciales de login
export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

// Respuesta de login - requiere 2FA
export interface RespuestaLoginRequiere2FA {
  requiere2FA: true;
  tokenTemporal: string;
  expiraEn: number;
}

// Respuesta de login - requiere configurar 2FA
export interface RespuestaLoginConfigurar2FA {
  requiere2FA: false;
  requiereConfigurar2FA: true;
  tokenTemporal: string;
  qrCode: string;
  secreto: string;
  expiraEn: number;
}

export type RespuestaLogin = RespuestaLoginRequiere2FA | RespuestaLoginConfigurar2FA;

// Respuesta de verificación 2FA
export interface RespuestaAuth {
  accessToken: string;
  expiraEn: number;
  usuario: {
    id: string;
  };
  empresas: Empresa[];
  empresaActiva: string | '';
  codigosRecuperacion?: string[];
}

// Respuesta de selección de empresa
export interface RespuestaEmpresa {
  accessToken: string;
  expiraEn: number;
  empresa: Empresa;
}

// Respuesta de refresh
export interface RespuestaRefresh {
  accessToken: string;
  expiraEn: number;
  usuario: {
    id: string;
  };
  empresas: Empresa[];
  empresaActiva: string | '';
}

// Respuesta de /me
export interface RespuestaMe {
  id: string;
  empresas: Empresa[];
}

// ============================================
// Empresa y Usuario
// ============================================

export interface Empresa {
  id: string;
  razonSocial: string;
  rol: 'ADMINISTRADOR' | 'USUARIO';
}

export interface Usuario {
  id: string;
  nombre?: string;
  email?: string;
  empresas: Empresa[];
  empresaActiva: Empresa | null;
}

// ============================================
// Producto
// ============================================

export type UnidadProducto = 'UNIDAD' | 'KILOGRAMO' | 'GRAMO' | 'LITRO' | 'METRO' | 'CAJA';

export interface Producto {
  id: string;
  codigo?: string;
  nombre: string;
  precioConIva: number;
  unidad: UnidadProducto;
  stockMinimo?: number;
  activo: boolean;
}

export interface DatosProducto {
  codigo?: string;
  nombre: string;
  precioConIva: number;
  unidad: UnidadProducto;
  stockMinimo?: number;
}

// ============================================
// Contacto (cliente/proveedor)
// ============================================

export interface Contacto {
  id: string;
  nombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  esCliente: boolean;
  esProveedor: boolean;
  activo: boolean;
}

export interface DatosContacto {
  nombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  esCliente: boolean;
  esProveedor: boolean;
}

// ============================================
// Venta
// ============================================

export interface LineaVenta {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface Venta {
  id: string;
  numero: number;
  fecha: string;
  clienteId?: string;
  clienteNombre?: string;
  neto: number;
  iva: number;
  total: number;
  lineas: LineaVenta[];
  anulada: boolean;
  motivoAnulacion?: string;
}

export interface SolicitudVenta {
  clienteId?: string;
  lineas: {
    productoId: string;
    cantidad: number;
  }[];
}

// ============================================
// Compra
// ============================================

export interface LineaCompra {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  costoUnitario: number;
  total: number;
}

export interface Compra {
  id: string;
  numero: number;
  folio: string;
  fecha: string;
  fechaDocumento: string;
  proveedorId?: string;
  proveedorNombre?: string;
  neto: number;
  iva: number;
  total: number;
  lineas: LineaCompra[];
  anulada: boolean;
  motivoAnulacion?: string;
}

export interface SolicitudCompra {
  proveedorId?: string;
  folio: string;
  fechaDocumento: string;
  lineas: {
    productoId: string;
    cantidad: number;
    costoUnitario: number;
  }[];
}

// ============================================
// Inventario (Kardex)
// ============================================

export type TipoMovimiento =
  | 'INVENTARIO_INICIAL'
  | 'AJUSTE_ENTRADA'
  | 'AJUSTE_SALIDA'
  | 'VENTA'
  | 'ANULACION_VENTA'
  | 'COMPRA'
  | 'ANULACION_COMPRA';

export interface MovimientoInventario {
  id: string;
  numero: number;
  fecha: string;
  tipo: TipoMovimiento;
  cantidad: number;
  saldo: number;
  motivo?: string;
  usuarioId: string;
  ventaId?: string;
  compraId?: string;
}

export interface SolicitudMovimiento {
  tipo: 'INVENTARIO_INICIAL' | 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA';
  cantidad: number;
  motivo?: string;
}

export interface Kardex {
  stock: number;
  movimientos: MovimientoInventario[];
}

// ============================================
// Mi Cuenta
// ============================================

export interface Perfil {
  id: string;
  email: string;
  nombreMostrar?: string;
  fotoUrl?: string;
  zonaHoraria: string;
  formatoNumeros: string;
  emailVerificado: boolean;
}

export interface ActualizarPerfil {
  nombreMostrar?: string;
  fotoUrl?: string;
  zonaHoraria?: string;
  formatoNumeros?: string;
}

export interface CambioContrasena {
  contrasenaActual: string;
  contrasenaNueva: string;
}

export interface CambioEmail {
  nuevoEmail: string;
}

export interface SesionActiva {
  id: string;
  ipOrigen: string;
  userAgent: string;
  creadoEn: string;
  usadoEn: string;
  esActual: boolean;
}

export interface Actividad {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string;
  ocurridoEn: string;
  empresa?: string;
}
