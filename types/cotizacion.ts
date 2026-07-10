export interface ClienteData {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
}

export interface CotizacionItem {
  item: number;
  codigo: string;
  cantidad: number;
  unidad: string;
  descripcion: string;
  precioVenta: number;
  importe: number;
}

export interface CotizacionPDFProps {
  id: number;
  cliente: ClienteData;
  cabecera: FacturaCabecera;
  items: CotizacionItem[];
  fechaEmision: string;
  horaEmision: string;
}

export interface FacturaCabecera {
  fechaEmision: string;
  fechaVencimiento: string;
  condicionPago: string;
  moneda: string;
}