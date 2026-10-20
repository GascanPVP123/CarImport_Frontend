export interface KpiDTO {
  ventasDelMes: number;
  porcentajeVariacionVentas: number;
  utilidadBrutaEstimada: number;
  margenPorcentaje: number;
  cuentasPorCobrar: number;
  clientesConSaldoPendiente: number;
  valorEnConsignacion: number;
  tiendasAliadasActivas: number;
}

export interface TendenciaMensualDTO {
  mes: string;
  numeroMes?: number;
  ventas: number;
  cobranzas: number;
}

export interface CarteraItemDTO {
  canal: string;
  montoTotal: number;
  porcentaje: number;
  colorHex: string;
}

export interface OperacionRecienteDTO {
  id: number;
  nroComprobante: string;
  tipoOperacion: string;
  clienteProveedor: string;
  inicialesCliente: string;
  fechaHora: string;
  monto: number;
  estado: string;
}

export interface DashboardEjecutivoResponse {
  kpis: KpiDTO;
  tendenciaIngresos: TendenciaMensualDTO[];
  distribucionCartera: {
    totalMes: number;
    canales: CarteraItemDTO[];
  };
  ultimasOperaciones: OperacionRecienteDTO[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const dashboardService = {
  obtenerEjecutivo: async (anio = 2026, mes = 10): Promise<DashboardEjecutivoResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`${API_BASE_URL}/dashboard/ejecutivo?anio=${anio}&mes=${mes}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: HTTP ${response.status} (${response.statusText})`);
    }

    return response.json();
  }
};