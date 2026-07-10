"use client";

import { useEffect, useState } from "react";
import { productoService, Producto } from "@/services/productoService";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { StockBarChart } from "@/components/dashboard/StockBarChart";
import { StockPieChart } from "@/components/dashboard/StockPieChart";
import { ImportadoraChart } from "@/components/dashboard/ImportadoraChart";

export default function DashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productoService
      .listar()
      .then((data) => {
        setProductos(data);
      })
      .catch((err: unknown) => {
        const mensaje = err instanceof Error ? err.message : "Error desconocido";
        console.error("Error al cargar productos:", mensaje);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 animate-pulse">Cargando dashboard...</p>
      </div>
    );
  }

  // Cálculos para las tarjetas
  const totalProductos = productos.length;
  const stockBajo = productos.filter((p) => p.stock <= p.stockMinimo).length;
  const stockNormal = totalProductos - stockBajo;
  const valorTotal = productos.reduce(
    (sum, p) => sum + p.precioVenta * p.stock,
    0
  );

  // Importadoras únicas
  const importadorasUnicas = new Set(
    productos
      .filter((p) => p.importadora?.razonSocial)
      .map((p) => p.importadora!.razonSocial)
  );
  const totalImportadoras = importadorasUnicas.size;

  // Datos para el gráfico de barras (top 10 productos por stock)
  const barData = productos
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10)
    .map((p) => ({
      nombre: p.nombre,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
    }));

  // Datos para el gráfico de importadoras
  const importadoraData = Array.from(importadorasUnicas).map((nombre) => ({
    nombre,
    totalProductos: productos.filter((p) => p.importadora?.razonSocial === nombre).length,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard 📊
        </h1>
        <p className="text-slate-500 text-sm">
          Resumen general del inventario y estadísticas.
        </p>
      </div>

      <StatsCards
        totalProductos={totalProductos}
        stockBajo={stockBajo}
        valorTotal={valorTotal}
        totalImportadoras={totalImportadoras}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <StockBarChart data={barData} />
        <StockPieChart stockNormal={stockNormal} stockBajo={stockBajo} />
      </div>

      <ImportadoraChart data={importadoraData} />
    </div>
  );
}