"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  titulo: string;
  valor: string | number;
  icono?: React.ReactNode;
  colorScheme?: "emerald" | "blue" | "amber" | "rose" | "purple" | "slate" | "cyan";
  tendencia?: {
    valor: number;
    label?: string;
  };
  subtitulo?: string;
}

const COLORES = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-100/70 to-white",
    border: "border-emerald-200/50",
    iconoBg: "bg-emerald-500 text-white",
    valor: "text-emerald-700",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-100/70 to-white",
    border: "border-blue-200/50",
    iconoBg: "bg-blue-500 text-white",
    valor: "text-blue-700",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-100/70 to-white",
    border: "border-amber-200/50",
    iconoBg: "bg-amber-500 text-white",
    valor: "text-amber-700",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-100/70 to-white",
    border: "border-rose-200/50",
    iconoBg: "bg-rose-500 text-white",
    valor: "text-rose-700",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-100/70 to-white",
    border: "border-purple-200/50",
    iconoBg: "bg-purple-500 text-white",
    valor: "text-purple-700",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-100/70 to-white",
    border: "border-cyan-200/50",
    iconoBg: "bg-cyan-500 text-white",
    valor: "text-cyan-700",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-100/70 to-white",
    border: "border-slate-200/50",
    iconoBg: "bg-slate-500 text-white",
    valor: "text-slate-800",
  },
};

export function KPICard({
  titulo,
  valor,
  icono,
  colorScheme = "slate",
  tendencia,
  subtitulo,
}: KPICardProps) {
  const c = COLORES[colorScheme];

  return (
    <div
      className={`relative ${c.bg} ${c.border} border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden group`}
    >
      {/* Círculo decorativo de fondo */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${c.bg} opacity-40 group-hover:scale-110 transition-transform duration-500`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {icono && (
            <div className={`p-2.5 rounded-xl ${c.iconoBg} shadow-md`}>
              {icono}
            </div>
          )}
          {tendencia && (
            <div
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                tendencia.valor >= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {tendencia.valor >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {tendencia.valor >= 0 ? "+" : ""}
              {tendencia.valor}%
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {titulo}
          </p>
          <h3 className={`text-3xl font-bold ${c.valor} leading-none`}>
            {valor}
          </h3>
          {subtitulo && (
            <p className="text-[11px] text-gray-400 mt-1.5">{subtitulo}</p>
          )}
        </div>
      </div>
    </div>
  );
}