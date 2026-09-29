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
  mini?: boolean;
}

const COLORES = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50/80 to-white",
    border: "border-emerald-100",
    iconoBg: "bg-emerald-100 text-emerald-600",
    valor: "text-emerald-700",
    glow: "shadow-emerald-100",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50/80 to-white",
    border: "border-blue-100",
    iconoBg: "bg-blue-100 text-blue-600",
    valor: "text-blue-700",
    glow: "shadow-blue-100",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50/80 to-white",
    border: "border-amber-100",
    iconoBg: "bg-amber-100 text-amber-600",
    valor: "text-amber-700",
    glow: "shadow-amber-100",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-50/80 to-white",
    border: "border-rose-100",
    iconoBg: "bg-rose-100 text-rose-600",
    valor: "text-rose-700",
    glow: "shadow-rose-100",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50/80 to-white",
    border: "border-purple-100",
    iconoBg: "bg-purple-100 text-purple-600",
    valor: "text-purple-700",
    glow: "shadow-purple-100",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-50/80 to-white",
    border: "border-cyan-100",
    iconoBg: "bg-cyan-100 text-cyan-600",
    valor: "text-cyan-700",
    glow: "shadow-cyan-100",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-50 to-white",
    border: "border-slate-200",
    iconoBg: "bg-slate-100 text-slate-600",
    valor: "text-slate-800",
    glow: "shadow-slate-100",
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
      className={`relative ${c.bg} ${c.border} border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden`}
    >
      {/* Icono de fondo grande (opacity) */}
      {icono && (
        <div className={`absolute -right-4 -top-4 opacity-[0.06] ${c.valor}`}>
          <div className="scale-[4]">{icono}</div>
        </div>
      )}

      <div className="relative flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {titulo}
        </p>
        {icono && (
          <div className={`p-2 rounded-xl ${c.iconoBg} transition`}>{icono}</div>
        )}
      </div>

      <div className="relative flex items-end justify-between">
        <div>
          <h3 className={`text-3xl font-bold ${c.valor} leading-none`}>
            {valor}
          </h3>
          {subtitulo && (
            <p className="text-[11px] text-gray-400 mt-1">{subtitulo}</p>
          )}
        </div>

        {tendencia && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
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
    </div>
  );
}