import { apiRequest } from "./api";

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

export const dashboardService = {
  obtenerEjecutivo: (anio = 2026, mes = 10) =>
    apiRequest<DashboardEjecutivoResponse>(`/dashboard/ejecutivo?anio=${anio}&mes=${mes}`, {
      method: "GET",
    }),
};