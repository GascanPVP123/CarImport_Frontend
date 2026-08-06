"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Package, AlertTriangle, Truck, DollarSign,
  FileText, Wallet, ShoppingCart, Users, ArrowRight, Plus
} from "lucide-react";
import { productoService } from "@/services/productoService";
import { consignacionService } from "@/services/consignacionService";
import { cuentaCorrienteService } from "@/services/cuentaCorrienteService";

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

  // Carga inicial sin useEffect
  if (!inicializado) {
    setInicializado(true);
    cargarKPIs();
  }

  const modulos = [
    {
      titulo: "Productos e Inventario",
      descripcion: "Catálogo, stock, importadoras y tarifas",
      icono: <Package className="h-8 w-8" />,
      href: "/dashboard/productos",
      color: "emerald",
      stats: `${kpis.productos} productos`,
    },
    {
      titulo: "Cotizaciones",
      descripcion: "Crear y gestionar cotizaciones",
      icono: <FileText className="h-8 w-8" />,
      href: "/dashboard/cotizaciones",
      color: "blue",
      stats: "Nueva cotización",
    },
    {
      titulo: "Consignaciones",
      descripcion: "Envíos a tiendas aliadas",
      icono: <Truck className="h-8 w-8" />,
      href: "/dashboard/consignaciones",
      color: "purple",
      stats: `${kpis.consignacionesActivas} activas`,
    },
    {
      titulo: "Cuentas Corrientes",
      descripcion: "Deudas y cobros con tiendas",
      icono: <Wallet className="h-8 w-8" />,
      href: "/dashboard/cuentas-corrientes",
      color: "amber",
      stats: `S/ ${kpis.saldoPendiente.toFixed(0)} por cobrar`,
    },
    {
      titulo: "Pedidos",
      descripcion: "Seguimiento de pedidos",
      icono: <ShoppingCart className="h-8 w-8" />,
      href: "/dashboard/pedidos",
      color: "rose",
      stats: "Ver pedidos",
    },
    {
      titulo: "Clientes",
      descripcion: "Base de datos de clientes",
      icono: <Users className="h-8 w-8" />,
      href: "/dashboard/clientes",
      color: "cyan",
      stats: "Gestionar clientes",
    },
  ];

  const colores: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100",
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100",
    purple: "border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-400 hover:bg-purple-100",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-100",
  };

  const iconosColores: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    amber: "text-amber-600 bg-amber-100",
    rose: "text-rose-600 bg-rose-100",
    cyan: "text-cyan-600 bg-cyan-100",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-slate-500 text-sm mt-1">Bienvenido al sistema de gestión CarImport</p>
        </div>
        <Link href="/dashboard/cotizaciones" className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm">
          <Plus className="h-4 w-4" /> Nueva Cotización
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Productos" value={loading ? "..." : kpis.productos} icon={<Package className="h-5 w-5" />} color="emerald" />
        <KPICard label="Stock Bajo" value={loading ? "..." : kpis.stockBajo} icon={<AlertTriangle className="h-5 w-5" />} color="amber" />
        <KPICard label="Consignaciones" value={loading ? "..." : kpis.consignacionesActivas} icon={<Truck className="h-5 w-5" />} color="blue" />
        <KPICard label="Por Cobrar" value={loading ? "..." : `S/ ${kpis.saldoPendiente.toFixed(0)}`} icon={<DollarSign className="h-5 w-5" />} color="purple" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulos.map((mod) => (
            <Link key={mod.href} href={mod.href} className={`p-5 border rounded-xl shadow-sm transition-all duration-200 group hover:shadow-md ${colores[mod.color]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${iconosColores[mod.color]} group-hover:scale-110 transition`}>{mod.icono}</div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <h3 className="font-bold text-slate-900">{mod.titulo}</h3>
              <p className="text-xs mt-1 opacity-80">{mod.descripcion}</p>
              <p className="text-xs font-semibold mt-2 opacity-60">{mod.stats}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">¿Qué deseas hacer?</h3>
            <p className="text-sm text-emerald-100 mt-1">Accesos directos a las funciones principales</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/cotizaciones" className="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition">Nueva Cotización</Link>
            <Link href="/dashboard/productos" className="border border-white/50 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition">Ver Productos</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colores: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${colores[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}