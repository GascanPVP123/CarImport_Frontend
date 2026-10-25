'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Landmark,
  CreditCard,
  Truck,
  Filter,
  RefreshCw,
  Calendar,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  AlertCircle
} from 'lucide-react';

import { dashboardService, DashboardEjecutivoResponse } from '@/services/dashboardService';

export default function DashboardEjecutivo() {
  const [data, setData] = useState<DashboardEjecutivoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const resultado = await dashboardService.obtenerEjecutivo(2026, 10);
      setData(resultado);
      setError(null);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al conectar con el backend de CarImport';
      setError(mensaje);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;

    const timer = setTimeout(() => {
      if (!cancelado) {
        cargarDatos();
      }
    }, 0);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [cargarDatos]);

  const handleRecargarManual = () => {
    setLoading(true);
    cargarDatos();
  };

  const formatCurrency = (val: number) => {
    return `S/ ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Cobrado':
      case 'Acreditado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Por Facturar':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'En Tránsito':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Regularizado':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatearFechaHora = (fechaIso: string) => {
    try {
      const fecha = new Date(fechaIso);
      if (isNaN(fecha.getTime())) return fechaIso;
      return `${fecha.toLocaleDateString('es-PE')} ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return fechaIso;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] text-slate-600 font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold">Consultando base de datos PostgreSQL...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] p-6 font-sans">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-lg shadow-sm text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No se pudieron cargar los datos</h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">{error}</p>
          <button
            onClick={handleRecargarManual}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-7 font-sans text-slate-800">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Consolidado Corporativo
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resumen general del rendimiento financiero, ventas y estado de inventario de CarImport
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Este Mes (Octubre 2026)</span>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>
          <button className="flex items-center gap-2 bg-[#047857] hover:bg-[#065f46] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm shadow-emerald-900/10 transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Informe Gerencial</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Ventas del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(data.kpis.ventasDelMes)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                ↗ +{data.kpis.porcentajeVariacionVentas}%
              </span>
              <span className="text-slate-400 text-[11px]">vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="leading-tight">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block">Utilidad Bruta</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">ESTIMADA</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(data.kpis.utilidadBrutaEstimada)}
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <div>
                Margen <span className="font-bold text-slate-800">{data.kpis.margenPorcentaje}%</span>
              </div>
              <div className="text-slate-400">Rentabilidad sólida</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Cuentas por Cobrar</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(data.kpis.cuentasPorCobrar)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-rose-600 font-bold text-[11px]">
                {data.kpis.clientesConSaldoPendiente} clientes
              </span>
              <span className="text-slate-400 text-[11px]">con saldo pendiente</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Valor en Consignación</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(data.kpis.valorEnConsignacion)}
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <div>
                <span className="font-bold text-slate-800">{data.kpis.tiendasAliadasActivas} tiendas</span> aliadas
              </div>
              <div className="text-slate-400">activas en plaza</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Tendencia de Ingresos y Cobranzas (2026)</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Comparativa mensual acumulada en Soles (Ene - Oct)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#065f46]"></span>
                <span className="text-slate-700 text-[11px]">Ventas Netas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]"></span>
                <span className="text-slate-700 text-[11px]">Cobranzas Efectivas</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.tendenciaIngresos} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCobranzas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), '']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#047857" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVentas)" />
                <Area type="monotone" dataKey="cobranzas" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCobranzas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Distribución de Cartera</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Participación según canal de venta</p>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribucionCartera.canales}
                  innerRadius={62}
                  outerRadius={84}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={3}
                  dataKey="montoTotal"
                  stroke="none"
                >
                  {data.distribucionCartera.canales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colorHex} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: unknown) => formatCurrency(Number(val) || 0)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL MES</span>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                S/ {(data.distribucionCartera.totalMes / 1000).toFixed(1)}K
              </span>
              <span className="text-[9px] font-medium text-slate-400">100% Ejecutado</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {data.distribucionCartera.canales.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.colorHex }}></span>
                  <span className="text-slate-600 text-[11px] font-medium">{item.canal}</span>
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-slate-900 mr-2">{item.porcentaje}%</span>
                  <span className="text-slate-400 font-medium">S/ {(item.montoTotal / 1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Últimas Operaciones Comerciales y Movimientos Clave
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Flujo en tiempo real de transacciones autorizadas, despachos y conciliaciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtrar</span>
            </button>
            <button
              onClick={handleRecargarManual}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e293b] text-white text-[10px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-5">N° Comprobante</th>
                <th className="py-3.5 px-5">Tipo Operación</th>
                <th className="py-3.5 px-5">Cliente / Proveedor</th>
                <th className="py-3.5 px-5">Fecha / Hora</th>
                <th className="py-3.5 px-5 text-right">Monto (S/)</th>
                <th className="py-3.5 px-5 text-center">Estado</th>
                <th className="py-3.5 px-5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.ultimasOperaciones.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">{op.nroComprobante}</td>
                  <td className="py-4 px-5 text-slate-700 font-medium">{op.tipoOperacion}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center border border-slate-200 shrink-0">
                        {op.inicialesCliente}
                      </div>
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {op.clienteProveedor}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                    {formatearFechaHora(op.fechaHora)}
                  </td>
                  <td className="py-4 px-5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {formatCurrency(op.monto)}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusBadge(op.estado)}`}>
                      {op.estado}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center whitespace-nowrap">
                    <button className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] inline-flex items-center gap-0.5 hover:underline">
                      Ver Detalle <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p className="text-[11px]">Mostrando {data.ultimasOperaciones.length} movimientos registrados</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-700">1 / 1</span>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}