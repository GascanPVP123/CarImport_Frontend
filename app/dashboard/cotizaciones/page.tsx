"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ModalConfirmDialogProps {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  colorConfirmar?: "red" | "emerald" | "amber";
  onConfirmar: () => void | Promise<void>;
  onCancelar: () => void;
}

const COLORES = {
  red: "bg-red-600 hover:bg-red-700",
  emerald: "bg-emerald-600 hover:bg-emerald-700",
  amber: "bg-amber-600 hover:bg-amber-700",
};

const ICONO_COLORES = {
  red: "bg-red-100 text-red-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
};

export function ModalConfirmDialog({
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  colorConfirmar = "red",
  onConfirmar,
  onCancelar,
}: ModalConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await onConfirmar();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${ICONO_COLORES[colorConfirmar]}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">{titulo}</h3>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{mensaje}</p>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition shadow-sm disabled:bg-gray-300 ${COLORES[colorConfirmar]}`}
          >
            {loading ? "Procesando..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}