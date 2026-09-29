"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

const DONUT_COLORS = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#8b5cf6", "#64748b"];

export interface FinanzasMensual {
  mes: string;
  ventas: number;
  ganancia: number;
}

export interface ImportadoraData {
  name: string;
  value: number;
}

export interface StockCriticoData {
  nombre: string;
  stock: number;
  stockMinimo: number;
}

export const VentasYGananciasChart = ({ data }: { data: FinanzasMensual[] }) => {
  const tieneDatos = data.some((d) => d.ventas > 0 || d.ganancia > 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[380px]">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Ventas vs. Ganancias del Año</h3>
        <p className="text-xs text-slate-500">Facturación bruta frente al margen operativo real</p>
      </div>
      <div className="flex-1 w-full">
        {!tieneDatos ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Sin movimientos registrados aún
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `S/ ${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                `S/ ${Number(value ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
                name === "ventas" ? "Facturación" : "Margen",
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
                formatter={(v) => (v === "ventas" ? "Facturación Bruta" : "Margen Bruto")}
              />
              <Area type="monotone" dataKey="ventas" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" />
              <Area type="monotone" dataKey="ganancia" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorGanancias)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export const ImportadorasDonutChart = ({ data }: { data: ImportadoraData[] }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[380px]">
      <h3 className="text-sm font-bold text-slate-900">Distribución por Importadora</h3>
      <p className="text-xs text-slate-500 mb-3">Concentración del catálogo activo</p>

      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Sin importadoras asignadas
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value">
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value ?? 0} productos`, "Cantidad"]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Productos</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
        {data.slice(0, 4).map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
            />
            <span className="text-[11px] text-slate-600 truncate font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StockCriticoBarChart = ({ data }: { data: StockCriticoData[] }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[360px]">
      <h3 className="text-sm font-bold text-slate-900">Alerta de Stock Crítico</h3>
      <p className="text-xs text-slate-500 mb-3">Top autopartes próximas a agotarse</p>
      <div className="flex-1 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Inventario en niveles óptimos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="nombre"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={130}
                tickFormatter={(v: string) => (v.length > 18 ? `${v.substring(0, 18)}...` : v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value ?? 0} unidades`, "Stock actual"]}
              />
              <Bar dataKey="stock" radius={[0, 6, 6, 0]}>
                {data.map((entry, idx) => (
                  <Cell
                    key={`bar-${idx}`}
                    fill={
                      entry.stock === 0
                        ? "#dc2626"
                        : entry.stock <= entry.stockMinimo
                        ? "#f59e0b"
                        : "#10b981"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};