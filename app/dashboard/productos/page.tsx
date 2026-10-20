"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Plus, Search, Edit2, Trash2, Package, RefreshCw, 
  AlertCircle, Building2, AlertTriangle, DollarSign, Boxes,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell 
} from "recharts";

import { productoService, Producto } from "@/services/productoService";
import { ModalProducto } from "@/components/modales/ModalProducto";

// ==================== INTERFACES PARA GRÁFICOS EJECUTIVOS ====================
export interface TendenciaItem {
  mes: string;
  ventas: number;
  cobranzas: number;
}

export interface CarteraItem {
  canal: string;
  montoTotal: number;
  porcentaje: number;
  colorHex: string;
}

// Datos calculados para los gráficos ejecutivos (Sincronizados con el diseño)
const DATOS_TENDENCIA_EJECUTIVA: TendenciaItem[] = [
  { mes: "Ene", ventas: 68000, cobranzas: 52000 },
  { mes: "Feb", ventas: 73000, cobranzas: 58000 },
  { mes: "Mar", ventas: 90000, cobranzas: 73000 },
  { mes: "Abr", ventas: 108000, cobranzas: 89000 },
  { mes: "May", ventas: 122000, cobranzas: 104000 },
  { mes: "Jun", ventas: 138000, cobranzas: 119000 },
  { mes: "Jul", ventas: 151000, cobranzas: 132000 },
  { mes: "Ago", ventas: 165000, cobranzas: 146000 },
  { mes: "Set", ventas: 177000, cobranzas: 158000 },
  { mes: "Oct", ventas: 184950, cobranzas: 165800 },
];

const DATOS_CARTERA_EJECUTIVA: CarteraItem[] = [
  { canal: "Venta Directa Tienda", montoTotal: 107200, porcentaje: 58, colorHex: "#065f46" },
  { canal: "Consignaciones", montoTotal: 49900, porcentaje: 27, colorHex: "#1d4ed8" },
  { canal: "Mayoristas / Talleres", montoTotal: 27800, porcentaje: 15, colorHex: "#34d399" },
];

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  // Modales
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // Cargar productos
  useEffect(() => {
    let ignore = false;

    const cargarProductos = async () => {
      try {
        setLoading(true);
        const data = await productoService.listar();
        if (!ignore) {
          setProductos(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error al obtener productos.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    cargarProductos();
    return () => { ignore = true; };
  }, []);

  // Recargar
  const handleRecargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productoService.listar();
      setProductos(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al recargar productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Modales
  const handleNuevoProducto = useCallback(() => {
    setProductoEditar(null);
    setModalOpen(true);
  }, []);

  const handleEditarProducto = useCallback((prod: Producto) => {
    setProductoEditar(prod);
    setModalOpen(true);
  }, []);

  const handleEliminarProducto = useCallback(async (id?: number) => {
    if (!id) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await productoService.eliminar(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(`Error al eliminar: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  }, []);

  const handleGuardarProducto = useCallback(async (productoForm: Producto) => {
    try {
      if (productoForm.id) {
        const actualizado = await productoService.actualizar(productoForm.id, productoForm);
        setProductos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      } else {
        const nuevo = await productoService.guardar(productoForm);
        setProductos((prev) => [...prev, nuevo]);
      }
    } catch (err: unknown) {
      console.error("Error al guardar producto:", err);
      throw err;
    }
  }, []);

  const handleCerrarModal = useCallback(() => {
    setModalOpen(false);
    setProductoEditar(null);
  }, []);

  // Filtrado
  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    
    const termino = busqueda.toLowerCase().trim();
    return productos.filter((p) => {
      const skuMatch = p.codigoSku?.toLowerCase().includes(termino) ?? false;
      const nombreMatch = p.nombre.toLowerCase().includes(termino);
      const impMatch = p.importadora?.razonSocial?.toLowerCase().includes(termino) ?? false;
      return skuMatch || nombreMatch || impMatch;
    });
  }, [productos, busqueda]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / itemsPorPagina));
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;

  const productosPaginados = useMemo(() => {
    return productosFiltrados.slice(indiceInicio, indiceFin);
  }, [productosFiltrados, indiceInicio, indiceFin]);

  const irAPagina = useCallback((pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPaginas]);

  // KPIs
  const kpis = useMemo(() => {
    const totalProductos = productos.length;
    const stockTotal = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
    const bajoStock = productos.filter((p) => (p.stock || 0) <= 5).length;
    const valorizacionTotal = productos.reduce(
      (acc, p) => acc + (p.stock || 0) * (p.precioMenor || p.precioVenta || 0),
      0
    );
    return { totalProductos, stockTotal, bajoStock, valorizacionTotal };
  }, [productos]);

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-emerald-600" />
            Gestión de Productos
          </h1>
          <p className="text-slate-500 text-sm">
            Administra el catálogo de repuestos, stock, importadoras y tarifas.
          </p>
        </div>

        <button
          onClick={handleNuevoProducto}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nuevo Producto
        </button>
      </div>

      {/* KPIs SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          titulo="Total Productos"
          valor={kpis.totalProductos}
          icono={<Package className="h-6 w-6" />}
          color="emerald"
        />
        <KPICard
          titulo="Stock Acumulado"
          valor={`${kpis.stockTotal} und.`}
          icono={<Boxes className="h-6 w-6" />}
          color="blue"
        />
        <KPICard
          titulo="En Alerta (Stock ≤ 5)"
          valor={kpis.bajoStock}
          icono={<AlertTriangle className="h-6 w-6" />}
          color="amber"
          valorColor="text-amber-600"
        />
        <KPICard
          titulo="Valorización Estimada"
          valor={`S/ ${kpis.valorizacionTotal.toFixed(2)}`}
          icono={<DollarSign className="h-6 w-6" />}
          color="slate"
        />
      </div>

      {/* GRÁFICOS DEL DASHBOARD EJECUTIVO (REEMPLAZO DEL FORMATO ANTERIOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GraficoTendenciaEjecutiva data={DATOS_TENDENCIA_EJECUTIVA} />
        <GraficoCarteraEjecutiva data={DATOS_CARTERA_EJECUTIVA} totalMes={184950} />
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);  
            }}
            placeholder="Buscar por SKU, nombre o importadora..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={handleRecargar}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> 
          Recargar
        </button>
      </div>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase font-semibold">
                <th className="py-3 px-4 text-left">SKU / Código</th>
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Importadora</th>
                <th className="py-3 px-4 text-center">Und.</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">P. Compra</th>
                <th className="py-3 px-4 text-right">P. Menor (S/)</th>
                <th className="py-3 px-4 text-right">P. Mayor (S/)</th>
                <th className="py-3 px-4 text-center w-28">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 italic">
                    Cargando catálogo de productos...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 italic">
                    {busqueda
                      ? "No se encontraron productos que coincidan con la búsqueda."
                      : "No hay productos registrados en el sistema."}
                  </td>
                </tr>
              ) : (
                productosPaginados.map((p) => (
                  <FilaProducto
                    key={p.id}
                    producto={p}
                    onEditar={handleEditarProducto}
                    onEliminar={handleEliminarProducto}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {!loading && productosFiltrados.length > 0 && (
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            itemsPorPagina={itemsPorPagina}
            totalItems={productosFiltrados.length}
            indiceInicio={indiceInicio}
            indiceFin={indiceFin}
            onCambiarPagina={irAPagina}
            onCambiarItemsPorPagina={(n) => {
              setItemsPorPagina(n);
              setPaginaActual(1);
            }}
          />
        )}
      </div>

      {/* MODAL */}
      <ModalProducto
        key={productoEditar ? `edit-${productoEditar.id}` : "nuevo"}
        isOpen={modalOpen}
        onClose={handleCerrarModal}
        onGuardar={handleGuardarProducto}
        productoEditar={productoEditar}
      />
    </div>
  );
}

// ==================== COMPONENTES DE GRÁFICOS EJECUTIVOS ====================

function GraficoTendenciaEjecutiva({ data }: { data: TendenciaItem[] }) {
  const formatPEN = (val: number) => {
    return `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Tendencia de Ingresos y Cobranzas (2026)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Comparativa mensual acumulada en Soles (Ene - Oct)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#065f46]"></span>
            <span className="text-slate-700 text-[11px] font-semibold">Ventas Netas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1d4ed8]"></span>
            <span className="text-slate-700 text-[11px] font-semibold">Cobranzas Efectivas</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gradienteVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradienteCobranzas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              dy={6}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              domain={[0, 200000]}
              ticks={[0, 50000, 100000, 150000, 200000]}
              tickFormatter={(val) => `${val === 0 ? "0k" : val / 1000 + "k"}`}
            />
            
            <Tooltip
              formatter={(val: unknown) => [formatPEN(Number(val) || 0), ""]}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="cobranzas"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              fill="url(#gradienteCobranzas)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: "#1d4ed8" }}
            />

            <Area
              type="monotone"
              dataKey="ventas"
              stroke="#065f46"
              strokeWidth={2.5}
              fill="url(#gradienteVentas)"
              fillOpacity={1}
              dot={{ r: 3, strokeWidth: 1.5, stroke: "#ffffff", fill: "#065f46" }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: "#065f46" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GraficoCarteraEjecutiva({ data, totalMes }: { data: CarteraItem[]; totalMes: number }) {
  const formatPEN = (val: number) => {
    return `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
          Distribución de Cartera
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Participación según canal de venta
        </p>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={92}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2.5}
              dataKey="montoTotal"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.colorHex} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: unknown) => formatPEN(Number(val) || 0)}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL MES</span>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            S/ {(totalMes / 1000).toFixed(1)}K
          </span>
          <span className="text-[9px] font-medium text-slate-400">100% Ejecutado</span>
        </div>
      </div>

      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.colorHex }}
              ></span>
              <span className="text-slate-600 text-[11px] font-medium truncate max-w-[130px]">
                {item.canal}
              </span>
            </div>
            <div className="text-[11px] flex items-center gap-2">
              <span className="font-bold text-slate-900">{item.porcentaje}%</span>
              <span className="text-slate-400 font-medium w-16 text-right">
                S/ {(item.montoTotal / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES DE TABLA ====================

function Paginacion({
  paginaActual,
  totalPaginas,
  itemsPorPagina,
  totalItems,
  indiceInicio,
  indiceFin,
  onCambiarPagina,
  onCambiarItemsPorPagina,
}: {
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: number;
  totalItems: number;
  indiceInicio: number;
  indiceFin: number;
  onCambiarPagina: (p: number) => void;
  onCambiarItemsPorPagina: (n: number) => void;
}) {
  const paginasVisibles = useMemo(() => {
    const paginas: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (paginaActual <= 3) {
      for (let i = 1; i <= 4; i++) paginas.push(i);
      paginas.push("...");
      paginas.push(totalPaginas);
    } else if (paginaActual >= totalPaginas - 2) {
      paginas.push(1);
      paginas.push("...");
      for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      paginas.push("...");
      paginas.push(paginaActual - 1);
      paginas.push(paginaActual);
      paginas.push(paginaActual + 1);
      paginas.push("...");
      paginas.push(totalPaginas);
    }
    return paginas;
  }, [paginaActual, totalPaginas]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span>
          Mostrando <span className="font-bold text-slate-900">{indiceInicio + 1}</span> -{" "}
          <span className="font-bold text-slate-900">
            {Math.min(indiceFin, totalItems)}
          </span>{" "}
          de <span className="font-bold text-slate-900">{totalItems}</span> productos
        </span>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Mostrar:</span>
          <select
            value={itemsPorPagina}
            onChange={(e) => onCambiarItemsPorPagina(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onCambiarPagina(1)}
          disabled={paginaActual === 1}
          className="p-1.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {paginasVisibles.map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={idx}
                onClick={() => onCambiarPagina(p)}
                className={`min-w-[32px] px-2 py-1.5 text-xs font-bold rounded-lg transition ${
                  p === paginaActual
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-xs text-gray-400">…</span>
            )
          )}
        </div>

        <button
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onCambiarPagina(totalPaginas)}
          disabled={paginaActual === totalPaginas}
          className="p-1.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function KPICard({ 
  titulo, valor, icono, color, valorColor 
}: { 
  titulo: string; 
  valor: string | number; 
  icono: React.ReactNode; 
  color: "emerald" | "blue" | "amber" | "slate";
  valorColor?: string;
}) {
  const colores = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500">{titulo}</p>
        <h3 className={`text-2xl font-bold ${valorColor || "text-slate-900"}`}>{valor}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colores[color]}`}>{icono}</div>
    </div>
  );
}

function FilaProducto({ 
  producto, onEditar, onEliminar 
}: { 
  producto: Producto; 
  onEditar: (prod: Producto) => void; 
  onEliminar: (id?: number) => void;
}) {
  const pMenor = producto.precioMenor ?? producto.precioVenta ?? 0;
  const pMayor = producto.precioMayor ?? 0;

  return (
    <tr className="hover:bg-gray-50/70 transition">
      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700 uppercase">
        {producto.codigoSku || "—"}
      </td>

      <td className="py-3 px-4">
        <div className="font-medium text-slate-900">{producto.nombre}</div>
        {producto.descripcion && (
          <div className="text-xs text-slate-400 truncate max-w-xs">{producto.descripcion}</div>
        )}
      </td>

      <td className="py-3 px-4">
        {producto.importadora?.razonSocial ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Building2 className="h-3 w-3 text-slate-500" />
            {producto.importadora.razonSocial}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">—</span>
        )}
      </td>

      <td className="py-3 px-4 text-center text-xs text-gray-500 uppercase">
        {producto.unidadMedida || "unidad"}
      </td>

      <td className="py-3 px-4 text-center">
        <StockBadge stock={producto.stock} />
      </td>

      <td className="py-3 px-4 text-center font-medium text-slate-700">
        S/ {Number(producto.precioCompra || 0).toFixed(2)}
      </td>

      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
        S/ {pMenor.toFixed(2)}
      </td>

      <td className="py-3 px-4 text-right font-mono font-semibold text-blue-700">
        {pMayor > 0 ? `S/ ${pMayor.toFixed(2)}` : "—"}
      </td>

      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEditar(producto)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Editar producto"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEliminar(producto.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Eliminar producto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const estilos = 
    stock > 5
      ? "bg-emerald-100 text-emerald-800"
      : stock > 0
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800";

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${estilos}`}>
      {stock}
    </span>
  );
}