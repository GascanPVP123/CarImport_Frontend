'use client';

import React, { useEffect, useState } from 'react';
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
  Sparkles
} from 'lucide-react';

interface KpiDTO {
  ventasDelMes: number;
  porcentajeVariacionVentas: number;
  utilidadBrutaEstimada: number;
  margenPorcentaje: number;
  cuentasPorCobrar: number;
  clientesConSaldoPendiente: number;
  valorEnConsignacion: number;
  tiendasAliadasActivas: number;
}

interface TendenciaMensualDTO {
  mes: string;
  ventas: number;
  cobranzas: number;
}

interface CarteraItemDTO {
  canal: string;
  montoTotal: number;
  porcentaje: number;
  colorHex: string;
}

interface OperacionRecienteDTO {
  id: number;
  nroComprobante: string;
  tipoOperacion: string;
  clienteProveedor: string;
  inicialesCliente: string;
  fechaHora: string;
  monto: number;
  estado: string;
}

interface DashboardData {
  kpis: KpiDTO;
  tendenciaIngresos: TendenciaMensualDTO[];
  distribucionCartera: {
    totalMes: number;
    canales: CarteraItemDTO[];
  };
  ultimasOperaciones: OperacionRecienteDTO[];
}

export default function DashboardEjecutivo() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/dashboard/ejecutivo?anio=2026&mes=10');
      if (!response.ok) throw new Error('Respuesta no válida');
      const result = await response.json();
      setData(result);
    } catch {
      // Fallback con los valores visuales exactos de la captura mientras se conecta el backend
      setData({
        kpis: {
          ventasDelMes: 184950,
          porcentajeVariacionVentas: 14.2,
          utilidadBrutaEstimada: 52380,
          margenPorcentaje: 28.3,
          cuentasPorCobrar: 48210,
          clientesConSaldoPendiente: 12,
          valorEnConsignacion: 36450,
          tiendasAliadasActivas: 8
        },
        tendenciaIngresos: [
          { mes: 'Ene', ventas: 68000, cobranzas: 52000 },
          { mes: 'Feb', ventas: 74000, cobranzas: 56000 },
          { mes: 'Mar', ventas: 90000, cobranzas: 71000 },
          { mes: 'Abr', ventas: 105000, cobranzas: 84000 },
          { mes: 'May', ventas: 119000, cobranzas: 99000 },
          { mes: 'Jun', ventas: 135000, cobranzas: 114000 },
          { mes: 'Jul', ventas: 148000, cobranzas: 128000 },
          { mes: 'Ago', ventas: 162000, cobranzas: 142000 },
          { mes: 'Set', ventas: 175000, cobranzas: 156000 },
          { mes: 'Oct', ventas: 184950, cobranzas: 165800 }
        ],
        distribucionCartera: {
          totalMes: 184950,
          canales: [
            { canal: 'Venta Directa Tienda', montoTotal: 107200, porcentaje: 58, colorHex: '#065f46' },
            { canal: 'Consignaciones', montoTotal: 49900, porcentaje: 27, colorHex: '#1d4ed8' },
            { canal: 'Mayoristas / Talleres', montoTotal: 27800, porcentaje: 15, colorHex: '#34d399' }
          ]
        },
        ultimasOperaciones: [
          {
            id: 1,
            nroComprobante: 'PED-00142',
            tipoOperacion: 'Venta Mayorista',
            clienteProveedor: 'Taller Autocentro Lima',
            inicialesCliente: 'TL',
            fechaHora: 'Hoy, 10:45 am',
            monto: 4250.00,
            estado: 'Cobrado'
          },
          {
            id: 2,
            nroComprobante: 'COT-00089',
            tipoOperacion: 'Cotización Aprobada',
            clienteProveedor: 'Repuestos & Frenos San Martín',
            inicialesCliente: 'RF',
            fechaHora: 'Hoy, 09:20 am',
            monto: 1890.00,
            estado: 'Por Facturar'
          },
          {
            id: 3,
            nroComprobante: 'CON-00034',
            tipoOperacion: 'Despacho Consignación',
            clienteProveedor: 'Lubricentro El Óvalo',
            inicialesCliente: 'LO',
            fechaHora: 'Ayer, 04:15 pm',
            monto: 3120.00,
            estado: 'En Tránsito'
          },
          {
            id: 4,
            nroComprobante: 'PAG-00055',
            tipoOperacion: 'Cobranza Letra',
            clienteProveedor: 'Biayo Autopartes EIRL',
            inicialesCliente: 'BA',
            fechaHora: 'Ayer, 02:00 pm',
            monto: 2500.00,
            estado: 'Acreditado'
          },
          {
            id: 5,
            nroComprobante: 'AJU-00012',
            tipoOperacion: 'Ajuste Físico Kardex',
            clienteProveedor: 'Entrada por Auditoría',
            inicialesCliente: 'AU',
            fechaHora: '15/10/2026',
            monto: 450.00,
            estado: 'Regularizado'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/dashboard/ejecutivo?anio=2026&mes=10');
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (isMounted) setData(result);
      } catch {
        if (isMounted) fetchDashboardData();
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val: number) => {
    return `S/ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Cargando Dashboard Ejecutivo CarImport...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-7 font-sans text-slate-800">
      {/* 1. Header con Buscador, Notificación y Perfil */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto, cliente..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              AJ
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-bold text-slate-800">Admin</p>
              <p className="text-[11px] text-slate-400">Gerente</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Título de Sección y Controles Superiores */}
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
          <div className="relative">
            <button className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Este Mes (Octubre 2026)</span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>
          </div>
          <button className="flex items-center gap-2 bg-[#047857] hover:bg-[#065f46] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm shadow-emerald-900/10 transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Informe Gerencial</span>
          </button>
        </div>
      </div>

      {/* 3. Tarjetas KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Ventas del Mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
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

        {/* KPI 2: Utilidad Bruta Estimada */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
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

        {/* KPI 3: Cuentas por Cobrar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
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

        {/* KPI 4: Valor en Consignación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
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

      {/* 4. Bloque de Gráficos (Línea + Dona) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de Tendencia de Ingresos */}
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
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
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
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#047857"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                />
                <Area
                  type="monotone"
                  dataKey="cobranzas"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCobranzas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Distribución de Cartera */}
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
            {/* Texto en el centro de la Dona */}
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

      {/* 5. Tabla de Últimas Operaciones Comerciales */}
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
              onClick={fetchDashboardData}
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
                  <td className="py-4 px-5 text-slate-500 text-[11px] whitespace-nowrap">{op.fechaHora}</td>
                  <td className="py-4 px-5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {formatCurrency(op.monto)}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusBadge(
                        op.estado
                      )}`}
                    >
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

        {/* Paginador inferior */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p className="text-[11px]">Mostrando 5 de 142 movimientos registrados hoy</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-700">1 / 29</span>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}