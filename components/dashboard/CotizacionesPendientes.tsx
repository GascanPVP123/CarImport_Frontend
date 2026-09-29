"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export interface CotizacionResumen {
  id: number | string;
  numero: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
}

export const CotizacionesPendientes = ({ items }: { items: CotizacionResumen[] }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Cotizaciones Recientes</h3>
          </div>
          <Link
            href="/dashboard/cotizaciones"
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Últimas cotizaciones emitidas en el sistema.
        </p>

        <div className="space-y-2.5 overflow-y-auto max-h-[240px] pr-1">
          {items.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No hay cotizaciones registradas.
            </div>
          ) : (
            items.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-slate-50/70 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 font-mono">{c.numero}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                      {c.estado || "BORRADOR"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{c.cliente}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs font-bold text-slate-900">S/ {c.total.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">{c.fecha}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};