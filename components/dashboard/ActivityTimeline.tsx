"use client";

import React from "react";
import { Package, Truck, Receipt, CreditCard, FileText } from "lucide-react";

export type TipoActividad = "STOCK" | "NOTA_VENTA" | "CONSIGNACION" | "PAGO" | "COTIZACION";

export interface Actividad {
  id: string | number;
  tipo: TipoActividad;
  descripcion: string;
  detalle: string;
  hora: string;
}

const ICONO_CONFIG: Record<TipoActividad, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  CONSIGNACION: { icon: Truck, color: "text-blue-600 bg-blue-50 border-blue-200" },
  NOTA_VENTA: { icon: Receipt, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  PAGO: { icon: CreditCard, color: "text-purple-600 bg-purple-50 border-purple-200" },
  STOCK: { icon: Package, color: "text-rose-600 bg-rose-50 border-rose-200" },
  COTIZACION: { icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-200" },
};

export const ActivityTimeline = ({ actividades }: { actividades: Actividad[] }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[360px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-900">Registro de Actividad</h3>
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          En vivo
        </span>
      </div>

      <div className="relative pl-6 space-y-4 overflow-y-auto flex-1 pr-1 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {actividades.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Sin actividad reciente registrada.</p>
        ) : (
          actividades.map((item) => {
            const config = ICONO_CONFIG[item.tipo] || ICONO_CONFIG.STOCK;
            const Icon = config.icon;
            return (
              <div key={item.id} className="relative flex items-start justify-between group">
                <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white ${config.color}`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <div className="pr-2">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{item.descripcion}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.detalle}</p>
                </div>
                <time className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{item.hora}</time>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};