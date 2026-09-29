"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Package, AlertTriangle, Truck, DollarSign, Plus
} from "lucide-react";
import { productoService } from "@/services/productoService";
import { consignacionService } from "@/services/consignacionService";
import { cuentaCorrienteService } from "@/services/cuentaCorrienteService";
import { KPICard } from "@/components/dashboard/KPICard";

export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    productos: 0,
    stockBajo: 0,
    consignacionesActivas: 0,
    saldoPendiente: 0,
  });
  const [loading, setLoading] = useState(true);
  const [inicializado, setInicializado] = useState(false);

  const cargarKPIs = async () => {
    try {
      const [productos, stockBajo, consignaciones, cuentas] = await Promise.all([
        productoService.listar(),
        productoService.listarStockBajo(),
        consignacionService.listarActivas(),
        cuentaCorrienteService.obtenerResumen(),
      ]);
      setKpis({
        productos: productos.length,
        stockBajo: stockBajo.length,
        consignacionesActivas: consignaciones.length,
        saldoPendiente: cuentas?.totalDebe || 0,
      });
    } catch (e) {
      console.error("Error al cargar KPIs:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!inicializado) {
    setInicializado(true);
    cargarKPIs();
  }

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Bienvenido al sistema de gestión CarImport
          </p>
        </div>
        <Link
          href="/dashboard/cotizaciones"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nueva Cotización
        </Link>
      </div>

      {/* KPIs MODERNOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Productos"
          value={loading ? "..." : kpis.productos}
          icon={Package}
          variant="emerald"
          delta={{ value: "+12%", isPositive: true }}
          subtitle="Últimos 30 días"
          loading={loading}
        />
        <KPICard
          title="Stock Bajo"
          value={loading ? "..." : kpis.stockBajo}
          icon={AlertTriangle}
          variant="amber"
          delta={{ value: "-5%", isPositive: false }}
          subtitle="Requieren reposición"
          loading={loading}
        />
        <KPICard
          title="Consignaciones"
          value={loading ? "..." : kpis.consignacionesActivas}
          icon={Truck}
          variant="blue"
          delta={{ value: "+8%", isPositive: true }}
          subtitle="En tiendas aliadas"
          loading={loading}
        />
        <KPICard
          title="Por Cobrar"
          value={loading ? "..." : `S/ ${kpis.saldoPendiente.toFixed(0)}`}
          icon={DollarSign}
          variant="purple"
          delta={{ value: "+15%", isPositive: true }}
          subtitle="Saldos pendientes"
          loading={loading}
        />
      </div>
    </div>
  );
}