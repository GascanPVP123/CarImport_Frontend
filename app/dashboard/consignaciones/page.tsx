"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  Plus, Search, RefreshCw, AlertCircle, Building2, Truck, 
  CheckCircle, RotateCcw, DollarSign, ShoppingCart, Undo2, Eye 
} from "lucide-react";
import { toast } from "sonner";
import { 
  consignacionService, Consignacion, ConsignacionRequest, 
  VentaConsignacionRequest, DevolucionConsignacionRequest 
} from "@/services/consignacionService";
import { tiendaAliadaService, TiendaAliada } from "@/services/tiendaAliadaService";
import { ModalConsignacion } from "@/components/consignacion/ModalConsignacion";
import { ModalTiendaAliada } from "@/components/consignacion/ModalTiendaAliada";
import { ModalVentaConsignacion } from "@/components/consignacion/ModalVentaConsignacion";
import { ModalDevolucionConsignacion } from "@/components/consignacion/ModalDevolucionConsignacion";
import { ModalDetalleConsignacion } from "@/components/consignacion/ModalDetalleConsignacion";

const ESTADO_CONFIG: Record<string, { color: string; icono: React.ReactNode; label: string }> = {
  ENVIADA: { 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    icono: <Truck className="h-3.5 w-3.5" />, 
    label: "Enviada" 
  },
  PARCIAL: { 
    color: "bg-amber-100 text-amber-800 border-amber-200", 
    icono: <ShoppingCart className="h-3.5 w-3.5" />, 
    label: "Parcial" 
  },
  COMPLETADA: { 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200", 
    icono: <CheckCircle className="h-3.5 w-3.5" />, 
    label: "Completada" 
  },
  DEVUELTA: { 
    color: "bg-red-100 text-red-800 border-red-200", 
    icono: <Undo2 className="h-3.5 w-3.5" />, 
    label: "Devuelta" 
  },
};

const COLORES_ICONOS: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
};

export default function ConsignacionesPage() {
  const [consignaciones, setConsignaciones] = useState<Consignacion[]>([]);
  const [tiendas, setTiendas] = useState<TiendaAliada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [modalConsignacionOpen, setModalConsignacionOpen] = useState(false);
  const [modalTiendaOpen, setModalTiendaOpen] = useState(false);
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [modalDevolucionOpen, setModalDevolucionOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [consignacionSeleccionada, setConsignacionSeleccionada] = useState<Consignacion | null>(null);

  const [inicializado, setInicializado] = useState(false);

  // ==================== CARGA DE DATOS ====================
  const cargarDatos = useCallback(async (mostrarToast = false) => {
    setLoading(true);
    try {
      const [consignacionesData, tiendasData] = await Promise.all([
        consignacionService.listar(),
        tiendaAliadaService.listarActivas(),
      ]);
      setConsignaciones(consignacionesData);
      setTiendas(tiendasData);
      setError(null);
      if (mostrarToast) {
        toast.success("Datos actualizados", {
          description: `${consignacionesData.length} consignaciones cargadas`,
        });
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar datos";
      setError(mensaje);
      toast.error("Error al cargar datos", { description: mensaje });
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  if (!inicializado) {
    setInicializado(true);
    cargarDatos();
  }

  // ==================== FILTRADO ====================
  const consignacionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return consignaciones;
    const termino = busqueda.toLowerCase();
    return consignaciones.filter(c =>
      c.numeroConsignacion?.toLowerCase().includes(termino) ||
      c.tienda?.nombre.toLowerCase().includes(termino) ||
      c.estado.toLowerCase().includes(termino)
    );
  }, [consignaciones, busqueda]);

  // ==================== KPIs ====================
  const kpis = useMemo(() => {
    const total = consignaciones.length;
    const activas = consignaciones.filter(c => c.estado === 'ENVIADA' || c.estado === 'PARCIAL').length;
    const completadas = consignaciones.filter(c => c.estado === 'COMPLETADA').length;
    const valorTotal = consignaciones.reduce((acc, c) => acc + (c.valorTotal || 0), 0);
    const valorVendido = consignaciones.reduce((acc, c) => acc + (c.valorVendido || 0), 0);
    const valorPendiente = valorTotal - valorVendido;
    return { total, activas, completadas, valorTotal, valorVendido, valorPendiente };
  }, [consignaciones]);

  // ==================== HANDLERS ====================
  const handleCrearConsignacion = useCallback(async (data: ConsignacionRequest) => {
    const toastId = toast.loading("Creando consignación...");
    try {
      await consignacionService.crear(data);
      toast.success("Consignación creada correctamente", { id: toastId });
      setModalConsignacionOpen(false);
      cargarDatos();
    } catch (err) {
      toast.error("Error al crear consignación", {
        id: toastId,
        description: err instanceof Error ? err.message : "Error desconocido",
      });
      throw err;
    }
  }, [cargarDatos]);

  const handleCrearTienda = useCallback(async (tienda: TiendaAliada) => {
    const toastId = toast.loading("Guardando tienda...");
    try {
      await tiendaAliadaService.guardar(tienda);
      toast.success("Tienda guardada correctamente", { id: toastId });
      setModalTiendaOpen(false);
      cargarDatos();
    } catch (err) {
      toast.error("Error al guardar tienda", {
        id: toastId,
        description: err instanceof Error ? err.message : "Error desconocido",
      });
      throw err;
    }
  }, [cargarDatos]);

  const handleRegistrarVenta = useCallback(async (data: VentaConsignacionRequest) => {
    if (!consignacionSeleccionada?.id) return;
    const toastId = toast.loading("Registrando venta...");
    try {
      await consignacionService.registrarVenta(consignacionSeleccionada.id, data);
      toast.success("Venta registrada correctamente", {
        id: toastId,
        description: `Consignación: ${consignacionSeleccionada.numeroConsignacion}`,
      });
      setModalVentaOpen(false);
      setConsignacionSeleccionada(null);
      cargarDatos();
    } catch (err) {
      toast.error("Error al registrar venta", {
        id: toastId,
        description: err instanceof Error ? err.message : "Error desconocido",
      });
      throw err;
    }
  }, [consignacionSeleccionada, cargarDatos]);

  const handleRegistrarDevolucion = useCallback(async (data: DevolucionConsignacionRequest) => {
    if (!consignacionSeleccionada?.id) return;
    const toastId = toast.loading("Registrando devolución...");
    try {
      await consignacionService.registrarDevolucion(consignacionSeleccionada.id, data);
      toast.success("Devolución registrada correctamente", {
        id: toastId,
        description: `Consignación: ${consignacionSeleccionada.numeroConsignacion}`,
      });
      setModalDevolucionOpen(false);
      setConsignacionSeleccionada(null);
      cargarDatos();
    } catch (err) {
      toast.error("Error al registrar devolución", {
        id: toastId,
        description: err instanceof Error ? err.message : "Error desconocido",
      });
      throw err;
    }
  }, [consignacionSeleccionada, cargarDatos]);

  const abrirVenta = useCallback((c: Consignacion) => {
    setConsignacionSeleccionada(c);
    setModalVentaOpen(true);
  }, []);

  const abrirDevolucion = useCallback((c: Consignacion) => {
    setConsignacionSeleccionada(c);
    setModalDevolucionOpen(true);
  }, []);

  const abrirDetalle = useCallback((c: Consignacion) => {
    setConsignacionSeleccionada(c);
    setModalDetalleOpen(true);
  }, []);

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8 text-emerald-600" />
            Venta en Consignación
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona envíos, ventas y devoluciones de productos a tiendas aliadas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalTiendaOpen(true)}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            <Building2 className="h-4 w-4" /> Nueva Tienda
          </button>
          <button
            onClick={() => setModalConsignacionOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nueva Consignación
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard titulo="Total" valor={kpis.total} icono={<Truck className="h-5 w-5" />} color="slate" />
        <KPICard titulo="Activas" valor={kpis.activas} icono={<ShoppingCart className="h-5 w-5" />} color="blue" />
        <KPICard titulo="Completadas" valor={kpis.completadas} icono={<CheckCircle className="h-5 w-5" />} color="emerald" />
        <KPICard titulo="V. Enviado" valor={`S/ ${kpis.valorTotal.toFixed(0)}`} icono={<DollarSign className="h-5 w-5" />} color="amber" />
        <KPICard titulo="V. Vendido" valor={`S/ ${kpis.valorVendido.toFixed(0)}`} icono={<CheckCircle className="h-5 w-5" />} color="emerald" />
        <KPICard titulo="V. Pendiente" valor={`S/ ${kpis.valorPendiente.toFixed(0)}`} icono={<RotateCcw className="h-5 w-5" />} color="red" />
      </div>

      {/* BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número, tienda o estado..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => cargarDatos(true)}
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
                <th className="py-3 px-4 text-left">N° Consignación</th>
                <th className="py-3 px-4 text-left">Tienda</th>
                <th className="py-3 px-4 text-center">Fecha Envío</th>
                <th className="py-3 px-4 text-center">Productos</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">V. Total</th>
                <th className="py-3 px-4 text-right">V. Vendido</th>
                <th className="py-3 px-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Cargando consignaciones...
                  </td>
                </tr>
              ) : consignacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                    {busqueda
                      ? "No se encontraron consignaciones que coincidan con la búsqueda."
                      : "No hay consignaciones registradas. ¡Crea la primera!"}
                  </td>
                </tr>
              ) : (
                consignacionesFiltradas.map((c) => {
                  const estadoConfig = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG.ENVIADA;
                  const puedeVender = c.estado === 'ENVIADA' || c.estado === 'PARCIAL';
                  const puedeDevolver = c.estado === 'ENVIADA' || c.estado === 'PARCIAL';

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {c.numeroConsignacion}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-900">{c.tienda?.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-slate-600">
                        {c.fechaEnvio}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-semibold text-slate-700">
                          {c.detalles?.length || 0} items
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${estadoConfig.color}`}>
                          {estadoConfig.icono}
                          {estadoConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-700">
                        S/ {c.valorTotal?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-emerald-700">
                        S/ {c.valorVendido?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => abrirDetalle(c)}
                            className="p-1.5 text-gray-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {puedeVender && (
                            <button
                              onClick={() => abrirVenta(c)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Registrar venta"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          )}
                          {puedeDevolver && (
                            <button
                              onClick={() => abrirDevolucion(c)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Registrar devolución"
                            >
                              <Undo2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      <ModalConsignacion
        isOpen={modalConsignacionOpen}
        onClose={() => setModalConsignacionOpen(false)}
        tiendas={tiendas}
        onGuardar={handleCrearConsignacion}
      />
      
      <ModalTiendaAliada
        isOpen={modalTiendaOpen}
        onClose={() => setModalTiendaOpen(false)}
        onGuardar={handleCrearTienda}
      />

      {consignacionSeleccionada && (
        <>
          <ModalVentaConsignacion
            isOpen={modalVentaOpen}
            onClose={() => {
              setModalVentaOpen(false);
              setConsignacionSeleccionada(null);
            }}
            consignacion={consignacionSeleccionada}
            onGuardar={handleRegistrarVenta}
          />
          
          <ModalDevolucionConsignacion
            isOpen={modalDevolucionOpen}
            onClose={() => {
              setModalDevolucionOpen(false);
              setConsignacionSeleccionada(null);
            }}
            consignacion={consignacionSeleccionada}
            onGuardar={handleRegistrarDevolucion}
          />

          <ModalDetalleConsignacion
            isOpen={modalDetalleOpen}
            onClose={() => {
              setModalDetalleOpen(false);
              setConsignacionSeleccionada(null);
            }}
            consignacion={consignacionSeleccionada}
          />
        </>
      )}
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

function KPICard({ 
  titulo, 
  valor, 
  icono, 
  color 
}: { 
  titulo: string; 
  valor: string | number; 
  icono: React.ReactNode; 
  color: string;
}) {
  const colorIcono = COLORES_ICONOS[color] || COLORES_ICONOS.slate;
  
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500">{titulo}</p>
        <h3 className="text-lg font-bold text-slate-900">{valor}</h3>
      </div>
      <div className={`p-2 rounded-lg ${colorIcono}`}>
        {icono}
      </div>
    </div>
  );
}