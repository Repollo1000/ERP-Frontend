# Plan de Personalización ERP

## Objetivo
Hacer el ERP más personalizable, similar a Odoo, permitiendo a los usuarios adaptar la interfaz y funcionalidades a sus necesidades.

---

## 1. Sistema de Vistas Guardadas

### Descripción
Permitir a los usuarios guardar combinaciones de filtros, columnas visibles y ordenamiento como "vistas" reutilizables.

### Frontend
- Componente `TablaAvanzada` con:
  - Selector de columnas visibles
  - Ordenamiento por clic en headers
  - Menú de vistas guardadas
  - Botón "Guardar vista actual"

### Backend Requerido

```
POST /api/vistas
{
  "modulo": "productos",
  "nombre": "Solo activos con stock bajo",
  "configuracion": {
    "columnas": ["codigo", "nombre", "precio", "stock"],
    "ordenPor": "stock",
    "ordenDir": "asc",
    "filtros": { "estado": "activo" }
  }
}

GET /api/vistas?modulo=productos
→ Lista de vistas del usuario para ese módulo

DELETE /api/vistas/{id}
```

### Base de Datos
```sql
CREATE TABLE vista_guardada (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuario(id),
  empresa_id UUID REFERENCES empresa(id),
  modulo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  configuracion JSONB NOT NULL,
  es_predeterminada BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Acciones Masivas

### Descripción
Seleccionar múltiples registros y aplicar acciones en lote.

### Acciones por Módulo

| Módulo | Acciones |
|--------|----------|
| Productos | Desactivar, Cambiar precio %, Exportar |
| Contactos | Desactivar, Asignar tipo, Exportar |
| Ventas | Exportar selección |
| Compras | Exportar selección |
| Inventario | Ajuste masivo de stock |

### Backend Requerido

```
POST /api/productos/masivo
{
  "accion": "desactivar",
  "ids": ["uuid1", "uuid2", "uuid3"]
}

POST /api/productos/masivo
{
  "accion": "ajustar_precio",
  "ids": ["uuid1", "uuid2"],
  "porcentaje": 10  // +10%
}

POST /api/inventario/masivo
{
  "accion": "ajuste_entrada",
  "items": [
    { "productoId": "uuid1", "cantidad": 100 },
    { "productoId": "uuid2", "cantidad": 50 }
  ],
  "motivo": "Inventario inicial"
}
```

### Respuesta
```json
{
  "exitosos": 3,
  "fallidos": 0,
  "errores": []
}
```

---

## 3. Dashboard Personalizable

### Descripción
Panel principal con widgets configurables que muestran KPIs y gráficos.

### Widgets Disponibles

| Widget | Tipo | Datos |
|--------|------|-------|
| Ventas del día | Número | Total $ |
| Ventas del mes | Número + gráfico | Total $ + tendencia |
| Productos bajo stock | Lista | Top 5 productos |
| Últimas ventas | Lista | Últimas 5 ventas |
| Últimas compras | Lista | Últimas 5 compras |
| Clientes nuevos | Número | Este mes |
| Gráfico ventas | Gráfico líneas | Últimos 30 días |
| Top productos | Gráfico barras | Más vendidos |

### Frontend
- Grid de widgets arrastrables (react-grid-layout o similar)
- Cada widget es un componente independiente
- Configuración guardada por usuario

### Backend Requerido

```
GET /api/dashboard/widgets
→ Configuración de widgets del usuario

PUT /api/dashboard/widgets
{
  "layout": [
    { "id": "ventas-dia", "x": 0, "y": 0, "w": 2, "h": 1 },
    { "id": "ventas-mes", "x": 2, "y": 0, "w": 2, "h": 1 },
    ...
  ]
}

GET /api/dashboard/kpis
→ Datos de todos los KPIs en una sola llamada
{
  "ventasDia": { "total": 150000, "cantidad": 5 },
  "ventasMes": { "total": 2500000, "cantidad": 45, "variacion": 12.5 },
  "productosBajoStock": [
    { "id": "...", "nombre": "...", "stock": 2, "minimo": 10 }
  ],
  "ultimasVentas": [...],
  "ultimasCompras": [...],
  "ventasUltimos30Dias": [
    { "fecha": "2024-01-01", "total": 50000 },
    ...
  ]
}
```

### Base de Datos
```sql
CREATE TABLE dashboard_config (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuario(id),
  empresa_id UUID REFERENCES empresa(id),
  layout JSONB NOT NULL,
  actualizado_en TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Campos Personalizados (Futuro)

### Descripción
Permitir agregar campos adicionales a productos, contactos, etc.

### Complejidad: ALTA
Requiere:
- Tabla de definición de campos
- Tabla de valores de campos
- UI para crear/editar campos
- Renderizado dinámico en formularios
- Validaciones dinámicas
- Reportes con campos custom

### Recomendación
Implementar en una fase posterior. Por ahora usar el campo `notas` o `metadata` JSON.

---

## 5. Filtros del Lado Servidor

### Descripción
Mover los filtros al backend para mejor rendimiento con muchos datos.

### Backend Actual
```
GET /api/productos?pagina=0
```

### Backend Propuesto
```
GET /api/productos?pagina=0&busqueda=texto&estado=activo&unidad=KILOGRAMO&ordenPor=nombre&ordenDir=asc
```

### Cambios Necesarios
- Modificar controladores para aceptar parámetros de filtro
- Agregar índices en BD si es necesario
- Frontend: cambiar de filtros locales a query params

---

## 6. Orden de Implementación Sugerido

### Fase 1: Frontend Solo (Sin cambios backend)
1. ✅ TablaToolbar con filtros y exportación
2. ⏳ TablaAvanzada con columnas ordenables
3. ⏳ Preferencias en localStorage
4. ⏳ Dashboard básico con datos existentes

### Fase 2: Backend Básico
1. Endpoint `/api/dashboard/kpis`
2. Filtros del lado servidor en listados
3. Ordenamiento del lado servidor

### Fase 3: Personalización Avanzada
1. Vistas guardadas (backend + frontend)
2. Acciones masivas
3. Dashboard configurable

### Fase 4: Campos Personalizados
1. Modelo de datos
2. API CRUD de campos
3. UI de configuración
4. Renderizado dinámico

---

## 7. Estimación de Esfuerzo

| Funcionalidad | Frontend | Backend | Total |
|---------------|----------|---------|-------|
| Tabla avanzada | Medio | - | Medio |
| Dashboard básico | Medio | Bajo | Medio |
| Filtros servidor | Bajo | Bajo | Bajo |
| Vistas guardadas | Bajo | Bajo | Bajo |
| Acciones masivas | Bajo | Medio | Medio |
| Dashboard config | Alto | Medio | Alto |
| Campos custom | Alto | Alto | Muy Alto |

---

## 8. Preguntas para Decidir

1. **Vistas guardadas**: ¿Las vistas deben ser por usuario o compartidas por empresa?

2. **Dashboard**: ¿Qué KPIs son más importantes para mostrar?

3. **Acciones masivas**: ¿Qué acciones necesitas con más urgencia?

4. **Filtros**: ¿Tienes muchos datos que hagan necesario filtrar en servidor?

5. **Prioridad**: ¿Qué te daría más valor inmediato?

---

## Próximos Pasos

1. Revisar este plan
2. Responder las preguntas de la sección 8
3. Priorizar qué implementar primero
4. Comenzar desarrollo por fases
