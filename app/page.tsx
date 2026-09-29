"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Package, AlertTriangle, Truck, DollarSign, Plus} from "lucide-react";
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
          titulo="Total Productos"
          valor={loading ? "..." : kpis.productos}
          icono={<Package className="h-5 w-5" />}
          colorScheme="emerald"
          tendencia={{ valor: 12 }}
          subtitulo="Últimos 30 días"
        />
        <KPICard
          titulo="Stock Bajo"
          valor={loading ? "..." : kpis.stockBajo}
          icono={<AlertTriangle className="h-5 w-5" />}
          colorScheme="amber"
          tendencia={{ valor: -5 }}
          subtitulo="Requieren reposición"
        />
        <KPICard
          titulo="Consignaciones"
          valor={loading ? "..." : kpis.consignacionesActivas}
          icono={<Truck className="h-5 w-5" />}
          colorScheme="blue"
          tendencia={{ valor: 8 }}
          subtitulo="En tiendas aliadas"
        />
        <KPICard
          titulo="Por Cobrar"
          valor={loading ? "..." : `S/ ${kpis.saldoPendiente.toFixed(0)}`}
          icono={<DollarSign className="h-5 w-5" />}
          colorScheme="purple"
          tendencia={{ valor: 15 }}
          subtitulo="Saldos pendientes"
        />
      </div>
    </div>
  );
}