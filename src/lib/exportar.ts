/**
 * Utilidades para exportar datos a Excel/CSV
 */

export interface ColumnaExport<T> {
  titulo: string;
  campo: keyof T | ((item: T) => string | number);
  formato?: 'texto' | 'numero' | 'moneda' | 'fecha';
}

/**
 * Convierte datos a formato CSV
 */
export function generarCSV<T>(
  datos: T[],
  columnas: ColumnaExport<T>[]
): string {
  // Header
  const header = columnas.map(col => `"${col.titulo}"`).join(',');

  // Rows
  const rows = datos.map(item => {
    return columnas.map(col => {
      let valor: string | number;

      if (typeof col.campo === 'function') {
        valor = col.campo(item);
      } else {
        valor = item[col.campo] as string | number;
      }

      // Formatear según tipo
      if (valor === null || valor === undefined) {
        return '""';
      }

      if (col.formato === 'moneda' && typeof valor === 'number') {
        return valor.toString();
      }

      if (col.formato === 'fecha' && typeof valor === 'string') {
        try {
          const fecha = new Date(valor);
          return `"${fecha.toLocaleDateString('es-CL')}"`;
        } catch {
          return `"${valor}"`;
        }
      }

      // Escapar comillas dobles
      const valorStr = String(valor).replace(/"/g, '""');
      return `"${valorStr}"`;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Descarga un archivo CSV
 */
export function descargarCSV(
  contenido: string,
  nombreArchivo: string
): void {
  // BOM para Excel reconozca UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${nombreArchivo}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga un archivo Excel (XLSX) usando formato XML
 * Compatible con Excel sin necesidad de librerías externas
 */
export function descargarExcel<T>(
  datos: T[],
  columnas: ColumnaExport<T>[],
  nombreArchivo: string,
  nombreHoja: string = 'Datos'
): void {
  // Generar XML de Excel
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#3AA597" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF"/>
    </Style>
    <Style ss:ID="moneda">
      <NumberFormat ss:Format="$ #,##0"/>
    </Style>
    <Style ss:ID="fecha">
      <NumberFormat ss:Format="dd/mm/yyyy"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${nombreHoja}">
    <Table>`;

  // Header row
  const headerRow = `
      <Row>
        ${columnas.map(col => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(col.titulo)}</Data></Cell>`).join('')}
      </Row>`;

  // Data rows
  const dataRows = datos.map(item => {
    const cells = columnas.map(col => {
      let valor: string | number;

      if (typeof col.campo === 'function') {
        valor = col.campo(item);
      } else {
        valor = item[col.campo] as string | number;
      }

      if (valor === null || valor === undefined) {
        return '<Cell><Data ss:Type="String"></Data></Cell>';
      }

      if (col.formato === 'moneda' && typeof valor === 'number') {
        return `<Cell ss:StyleID="moneda"><Data ss:Type="Number">${valor}</Data></Cell>`;
      }

      if (col.formato === 'numero' && typeof valor === 'number') {
        return `<Cell><Data ss:Type="Number">${valor}</Data></Cell>`;
      }

      if (col.formato === 'fecha' && typeof valor === 'string') {
        try {
          const fecha = new Date(valor);
          const fechaISO = fecha.toISOString().split('T')[0];
          return `<Cell ss:StyleID="fecha"><Data ss:Type="DateTime">${fechaISO}T00:00:00.000</Data></Cell>`;
        } catch {
          return `<Cell><Data ss:Type="String">${escapeXml(String(valor))}</Data></Cell>`;
        }
      }

      return `<Cell><Data ss:Type="String">${escapeXml(String(valor))}</Data></Cell>`;
    });

    return `
      <Row>
        ${cells.join('')}
      </Row>`;
  }).join('');

  const xmlFooter = `
    </Table>
  </Worksheet>
</Workbook>`;

  const xmlContent = xmlHeader + headerRow + dataRows + xmlFooter;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${nombreArchivo}.xls`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exporta datos con opción de formato
 */
export function exportarDatos<T>(
  datos: T[],
  columnas: ColumnaExport<T>[],
  nombreArchivo: string,
  formato: 'excel' | 'csv' = 'excel'
): void {
  if (formato === 'csv') {
    const csv = generarCSV(datos, columnas);
    descargarCSV(csv, nombreArchivo);
  } else {
    descargarExcel(datos, columnas, nombreArchivo);
  }
}
