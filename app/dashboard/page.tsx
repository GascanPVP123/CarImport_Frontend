"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Plus, Search, Edit2, Trash2, Package, RefreshCw, 
  AlertCircle, Building2, AlertTriangle, DollarSign, Boxes,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";

import { productoService, Producto } from "@/services/productoService";
import { ModalProducto } from "@/components/modales/ModalProducto";
import { ModalConfirmDialog } from "@/components/modales/ModalConfirmDialog";

const COLORES_GRAFICO = [
  "#10B981", "#3B82F6", "#F59E0B", "#EC4899", 
  "#8B5CF6", "#06B6D4", "#F43F5E", "#84CC16"
];

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  // Modales
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);

  // Eliminar
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // ==================== CARGA DE DATOS ====================
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

  const handleRecargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productoService.listar();
      setProductos(data);
      setError(null);
      toast.success("Datos actualizados", {
        description: `${data.length} productos cargados`,
      });
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al recargar";
      setError(mensaje);
      toast.error("Error al recargar", { description: mensaje });
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== MODALES ====================
  const handleNuevoProducto = useCallback(() => {
    setProductoEditar(null);
    setModalOpen(true);
  }, []);

  const handleEditarProducto = useCallback((prod: Producto) => {
    setProductoEditar(prod);
    setModalOpen(true);
  }, []);

  const abrirEliminar = useCallback((producto: Producto) => {
    setProductoEliminar(producto);
    setModalEliminarOpen(true);
  }, []);

  // ==================== GUARDAR PRODUCTO ====================
  const handleGuardarProducto = useCallback(async (productoForm: Producto) => {
    const toastId = toast.loading(
      productoForm.id ? "Actualizando producto..." : "Guardando producto..."
    );

    try {
      if (productoForm.id) {
        const actualizado = await productoService.actualizar(productoForm.id, productoForm);
        setProductos((prev) =>
          prev.map((p) => (p.id === actualizado.id ? actualizado : p))
        );
        toast.success("Producto actualizado correctamente", {
          id: toastId,
          description: actualizado.nombre,
        });
      } else {
        const nuevo = await productoService.guardar(productoForm);
        setProductos((prev) => [...prev, nuevo]);
        toast.success("Producto creado correctamente", {
          id: toastId,
          description: nuevo.nombre,
        });
      }
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al guardar";
      console.error("Error al guardar producto:", err);
      toast.error("Error al guardar producto", {
        id: toastId,
        description: mensaje,
      });
      throw err;
    }
  }, []);

  // ==================== ELIMINAR PRODUCTO ====================
  const confirmarEliminar = useCallback(async () => {
    if (!productoEliminar?.id) return;

    const id = productoEliminar.id;
    const nombre = productoEliminar.nombre;

    setModalEliminarOpen(false);

    const toastId = toast.loading("Eliminando producto...");

    try {
      await productoService.eliminar(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado", {
        id: toastId,
        description: nombre,
      });
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al eliminar";
      toast.error("Error al eliminar producto", {
        id: toastId,
        description: mensaje,
      });
    } finally {
      setProductoEliminar(null);
    }
  }, [productoEliminar]);

  const handleCerrarModal = useCallback(() => {
    setModalOpen(false);
    setProductoEditar(null);
  }, []);

  const handleCerrarEliminar = useCallback(() => {
    setModalEliminarOpen(false);
    setProductoEliminar(null);
  }, []);

  // ==================== FILTRADO ====================
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

  // ==================== PAGINACIÓN ====================
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

  // ==================== KPIs ====================
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

  // ==================== GRÁFICOS ====================
  const datosGraficoImportadora = useMemo(() => {
    const mapa: Record<string, number> = {};
    productos.forEach((p) => {
      const nombreImp = p.importadora?.razonSocial || "Sin Importadora";
      mapa[nombreImp] = (mapa[nombreImp] || 0) + 1;
    });
    return Object.keys(mapa).map((key) => ({ name: key, value: mapa[key] }));
  }, [productos]);

  const datosGraficoStockBajo = useMemo(() => {
    return [...productos]
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5)
      .map((p) => ({
        nombre: p.nombre.length > 15 ? `${p.nombre.substring(0, 15)}...` : p.nombre,
        stock: p.stock || 0,
      }));
  }, [productos]);

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
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

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard titulo="Total Productos" valor={kpis.totalProductos} icono={<Package className="h-6 w-6" />} color="emerald" />
        <KPICard titulo="Stock Acumulado" valor={`${kpis.stockTotal} und.`} icono={<Boxes className="h-6 w-6" />} color="blue" />
        <KPICard titulo="En Alerta (Stock ≤ 5)" valor={kpis.bajoStock} icono={<AlertTriangle className="h-6 w-6" />} color="amber" valorColor="text-amber-600" />
        <KPICard titulo="Valorización Estimada" valor={`S/ ${kpis.valorizacionTotal.toFixed(2)}`} icono={<DollarSign className="h-6 w-6" />} color="slate" />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoDonut data={datosGraficoImportadora} totalProductos={productos.length} />
        <GraficoStockBajo data={datosGraficoStockBajo} />
      </div>

      {/* BÚSQUEDA */}
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

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TABLA */}
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
                    onEliminar={abrirEliminar}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* MODAL PRODUCTO */}
      <ModalProducto
        key={productoEditar ? `edit-${productoEditar.id}` : "nuevo"}
        isOpen={modalOpen}
        onClose={handleCerrarModal}
        onGuardar={handleGuardarProducto}
        productoEditar={productoEditar}
      />

      {/* MODAL ELIMINAR */}
      {modalEliminarOpen && productoEliminar && (
        <ModalConfirmDialog
          titulo="¿Eliminar producto?"
          mensaje={`Se eliminará "${productoEliminar.nombre}" permanentemente. Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          colorConfirmar="red"
          onConfirmar={confirmarEliminar}
          onCancelar={handleCerrarEliminar}
        />
      )}
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

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

function GraficoDonut({ data, totalProductos }: { data: { name: string; value: number }[]; totalProductos: number }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100">
            <Building2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Distribución por Importadora</h4>
            <p className="text-[11px] text-gray-400">Productos agrupados por proveedor</p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {totalProductos} total
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-56 w-56 shrink-0 relative">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Sin datos</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold text-slate-900">{totalProductos}</p>
                <p className="text-[10px] text-gray-400 uppercase">Productos</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto max-h-56">
          {data.map((item, idx) => {
            const porcentaje = ((item.value / totalProductos) * 100).toFixed(1);
            return (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORES_GRAFICO[idx % COLORES_GRAFICO.length] }}
                  />
                  <span className="text-xs text-gray-700 truncate">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{item.value}</p>
                  <p className="text-[10px] text-gray-400">{porcentaje}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GraficoStockBajo({ data }: { data: { nombre: string; stock: number }[] }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Top 5 Menor Stock</h4>
            <p className="text-[11px] text-gray-400">Productos que requieren reposición</p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Alerta</span>
      </div>

      <div className="h-56 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Sin productos con stock bajo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
                formatter={(value) => [`${value} unidades`, "Stock"]}
              />
              <Bar dataKey="stock" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => {
                  const color = entry.stock <= 3 ? "#ef4444" : entry.stock <= 8 ? "#f59e0b" : "#10b981";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function FilaProducto({ 
  producto, onEditar, onEliminar 
}: { 
  producto: Producto; 
  onEditar: (prod: Producto) => void; 
  onEliminar: (prod: Producto) => void;
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
            onClick={() => onEliminar(producto)}
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