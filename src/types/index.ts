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

export type EstadoVenta = 'VIGENTE' | 'ANULADA';

// Línea de venta (del detalle)
export interface LineaVenta {
  numeroLinea: number;
  productoId: string;
  descripcion: string;
  cantidad: number;
  precioUnitarioConIva: number;
  total: number;
}

// Resumen de venta (para listados)
export interface VentaResumen {
  id: string;
  numero: number;
  emitidaEn: string;
  clienteId?: string;
  estado: EstadoVenta;
  total: number;
}

// Detalle completo de venta
export interface VentaDetalle {
  id: string;
  numero: number;
  emitidaEn: string;
  estado: EstadoVenta;
  clienteId?: string;
  total: number;
  neto: number;
  iva: number;
  lineas: LineaVenta[];
  anuladaEn?: string;
  motivoAnulacion?: string;
}

// Alias para compatibilidad (usa VentaResumen en listados)
export type Venta = VentaResumen;

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

// ============================================
// Respuestas Paginadas
// ============================================

export interface RespuestaPaginada<T> {
  contenido: T[];
  pagina: number;
  porPagina: number;
  totalElementos: number;
  totalPaginas: number;
  ordenPor: string;
  ordenDir: 'asc' | 'desc';
}

// Tipos para ordenamiento
export type DireccionOrden = 'asc' | 'desc';

export interface Ordenamiento {
  campo: string;
  direccion: DireccionOrden;
}

// ============================================
// Filtros por Módulo
// ============================================

export interface FiltrosProductos {
  q?: string;                    // Búsqueda por nombre o código exacto
  estado?: 'activo' | 'inactivo';
  unidad?: UnidadProducto;
  precioMin?: number;
  precioMax?: number;
  bajoStock?: boolean;
  sinStock?: boolean;
  ordenPor?: 'nombre' | 'codigo' | 'precio';
  ordenDir?: DireccionOrden;
  pagina?: number;
  porPagina?: number;
}

export type TipoPersona = 'NATURAL' | 'JURIDICA';

export interface FiltrosContactos {
  q?: string;                    // Búsqueda por nombre o RUT exacto
  tipo?: 'cliente' | 'proveedor';
  estado?: 'activo' | 'inactivo';
  tipoPersona?: TipoPersona;
  ordenPor?: string;
  ordenDir?: DireccionOrden;
  pagina?: number;
  porPagina?: number;
}

export interface FiltrosVentas {
  desde?: string;                // Fecha ISO
  hasta?: string;                // Fecha ISO
  clienteId?: string;
  estado?: 'emitida' | 'anulada';
  ordenPor?: string;
  ordenDir?: DireccionOrden;
  pagina?: number;
  porPagina?: number;
}

export interface FiltrosCompras {
  desde?: string;                // Fecha ISO
  hasta?: string;                // Fecha ISO
  proveedorId?: string;
  estado?: 'activa' | 'anulada';
  folio?: string;
  ordenPor?: string;
  ordenDir?: DireccionOrden;
  pagina?: number;
  porPagina?: number;
}

// ============================================
// Vistas Guardadas
// ============================================

export type ModuloVista = 'productos' | 'contactos' | 'ventas' | 'compras' | 'inventario';

export interface ConfiguracionVista {
  filtros: FiltrosProductos | FiltrosContactos | FiltrosVentas | FiltrosCompras | Record<string, unknown>;
  columnas: string[];
  orden?: {
    campo: string;
    dir: DireccionOrden;
  };
}

export interface Vista {
  id: string;
  modulo: ModuloVista;
  nombre: string;
  configuracion: ConfiguracionVista;
  compartida: boolean;
  predeterminada: boolean;
  creadoPor?: string;
  creadoEn?: string;
}

export interface CrearVista {
  modulo: ModuloVista;
  nombre: string;
  configuracion: ConfiguracionVista;
}

export interface RespuestaVistas {
  personales: Vista[];
  compartidas: Vista[];
}

// ============================================
// Acciones Masivas
// ============================================

export interface SolicitudAccionMasiva {
  ids: string[];
}

export interface RespuestaAccionMasiva {
  exitosos: number;
  fallidos: number;
  errores: string[];
}

// ============================================
// Dashboard Configurable
// ============================================

export type TipoWidget =
  | 'VENTAS_KPI'
  | 'COMPRAS_KPI'
  | 'INVENTARIO_KPI'
  | 'CONTACTOS_KPI'
  | 'GRAFICO_VENTAS_30D'
  | 'GRAFICO_VENTAS_DIA'
  | 'ALERTAS_INVENTARIO'
  | 'ULTIMAS_VENTAS'
  | 'ULTIMAS_COMPRAS'
  | 'TOP_CLIENTES'
  | 'TOP_PRODUCTOS';

export interface ConfiguracionWidget {
  tipo: TipoWidget;
  visible: boolean;
  orden?: number;
}

export interface ConfiguracionDashboard {
  widgets: ConfiguracionWidget[];
}

export interface WidgetDisponible {
  tipo: TipoWidget;
  nombre: string;
  descripcion: string;
  categoria: 'kpi' | 'grafico' | 'lista';
}

// KPIs completos del dashboard
export interface MetricasConVariacion {
  total: number;
  cantidad: number;
  variacion?: number;        // Porcentaje vs período anterior
}

export interface KPIsVentas {
  hoy: MetricasConVariacion;
  semana: MetricasConVariacion;
  mes: MetricasConVariacion;
}

export interface KPIsCompras {
  mes: MetricasConVariacion;
}

export interface KPIsInventario {
  productosActivos: number;
  productosBajoMinimo: number;
  productosSinStock: number;
  valorEstimado: number;
}

export interface KPIsContactos {
  clientesActivos: number;
  proveedoresActivos: number;
  nuevosEsteMes: number;
}

export interface TopProducto {
  id: string;
  codigo: string | null;
  nombre: string;
  cantidadVendida: number;
  totalVentas: number;
}

export interface TopCliente {
  id: string;
  nombre: string;
  totalCompras: number;
  cantidadCompras: number;
}

export interface VentaReciente {
  id: string;
  numero: number;
  cliente: string | null;
  total: number;
  emitidaEn: string;
}

export interface CompraReciente {
  id: string;
  numero: number;
  proveedor: string | null;
  total: number;
  fecha: string;
}

export interface ProductoAlerta {
  id: string;
  codigo: string | null;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

export interface DatosGrafico30D {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface KPIsCompletos {
  ventas: KPIsVentas;
  compras: KPIsCompras;
  inventario: KPIsInventario;
  contactos: KPIsContactos;
  topClientes: TopCliente[];
  topProductos: TopProducto[];
  ultimasVentas: VentaReciente[];
  ultimasCompras: CompraReciente[];
  alertasInventario: ProductoAlerta[];
  graficoVentas30D: DatosGrafico30D[];
}
