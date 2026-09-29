"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "emerald" | "rose" | "blue" | "amber" | "purple" | "slate";
  delta?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
}

const VARIANTES = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-100/70 to-white",
    border: "border-emerald-200/50",
    iconoBg: "bg-emerald-500 text-white shadow-emerald-200",
    valor: "text-emerald-700",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-100/70 to-white",
    border: "border-rose-200/50",
    iconoBg: "bg-rose-500 text-white shadow-rose-200",
    valor: "text-rose-700",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-100/70 to-white",
    border: "border-blue-200/50",
    iconoBg: "bg-blue-500 text-white shadow-blue-200",
    valor: "text-blue-700",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-100/70 to-white",
    border: "border-amber-200/50",
    iconoBg: "bg-amber-500 text-white shadow-amber-200",
    valor: "text-amber-700",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-100/70 to-white",
    border: "border-purple-200/50",
    iconoBg: "bg-purple-500 text-white shadow-purple-200",
    valor: "text-purple-700",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-100/70 to-white",
    border: "border-slate-200/50",
    iconoBg: "bg-slate-600 text-white shadow-slate-200",
    valor: "text-slate-800",
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "slate",
  delta,
  loading,
}: KPICardProps) {
  const c = VARIANTES[variant];

  if (loading) {
    return (
      <div className={`${c.bg} ${c.border} border rounded-2xl p-5 h-[140px] animate-pulse`}>
        <div className="w-10 h-10 rounded-xl bg-slate-200/50 mb-4" />
        <div className="w-20 h-3 bg-slate-200/50 rounded mb-2" />
        <div className="w-16 h-6 bg-slate-200/60 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`relative ${c.bg} ${c.border} border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden group`}
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${c.bg} opacity-40 group-hover:scale-110 transition-transform duration-500`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${c.iconoBg} shadow-md`}>
            <Icon className="h-5 w-5" />
          </div>
          {delta && (
            <div
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                delta.isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {delta.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {delta.value}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className={`text-3xl font-bold ${c.valor} leading-none`}>{value}</h3>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-1.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}