"use client";

import { X, FileText, CheckCircle } from "lucide-react";
import { CotizacionItem, ClienteData, FacturaCabecera } from "@/types/cotizacion";
import DescargarPDFButton from "@/components/cotizacion/DescargarPDFButton";
import CotizacionPDF from "@/components/cotizacion/CotizacionPDF";
import  NotaVentaPDF  from "@/components/cotizacion/NotaVentaPDF";
import { notaVentaService } from "@/services/notaVentaService";
import { useState } from "react";

interface ModalConfirmacionProps {
  cotizacionId: number;
  cliente: ClienteData;
  clienteId: number;
  cabecera: FacturaCabecera;
  items: CotizacionItem[];
  totalNeto: number;
  horaEmision: string;
  onClose: () => void;
}

export function ModalConfirmacion({
  cotizacionId,
  cliente,
  clienteId,
  cabecera,
  items,
  totalNeto,
  horaEmision,
  onClose,
}: ModalConfirmacionProps) {
  const [convertido, setConvertido] = useState(false);
  const [notaVentaId, setNotaVentaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const convertirANotaVenta = async () => {
    if (!confirm("¿Convertir a Nota de Venta? Esto descontará el inventario.")) return;
    setLoading(true);
    try {
      const res = await notaVentaService.crearDesdeCotizacion({
        cotizacionId,
        clienteId,
        condicionPago: cabecera.condicionPago,
        moneda: cabecera.moneda,
        detalles: items.map(item => ({
          productoId: item.productoId || 0,
          cantidad: item.cantidad,
          unidad: item.unidad,
          precioUnitario: item.precioVenta,
          descuento: 0,
        })),
      });
      setNotaVentaId(res.id);
      setConvertido(true);
      alert(`Nota de Venta NV-000${res.id} creada. Stock descontado.`);
    } catch (err) {
      alert("Error al crear nota de venta");
    } finally {
      setLoading(false);
    }
  };

  const descargarNotaVenta = async () => {
  if (!notaVentaId) return;
  
  // ✅ Obtener datos reales de la nota de venta desde el backend
  const notaVentaData = await notaVentaService.obtenerPorId(notaVentaId);
  console.log("Datos reales de nota de venta:", notaVentaData);
  
  const { pdf } = await import("@react-pdf/renderer");
  const blob = await pdf(
    <NotaVentaPDF datos={notaVentaData} />
  ).toBlob();
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `NotaVenta_NV-000${notaVentaId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Cotización Emitida - COT-000{cotizacionId}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 mb-6 text-sm">
            <p className="font-bold mb-2">Cliente: {cliente.nombre}</p>
            <p>RUC: {cliente.ruc}</p>
            <p>Dirección: {cliente.direccion}</p>
            <p>Total: S/ {totalNeto.toFixed(2)}</p>
            <p className="mt-2 text-slate-500">{items.length} productos en el detalle</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Botón 1: Descargar PDF Cotización */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">📄 Cotización (No descuenta stock)</p>
              <DescargarPDFButton
                documento={
                  <CotizacionPDF
                    id={cotizacionId}
                    cliente={cliente}
                    cabecera={cabecera}
                    items={items}
                    fechaEmision={cabecera.fechaEmision}
                    horaEmision={horaEmision}
                  />
                }
                nombreArchivo={`Cotizacion_${cotizacionId}.pdf`}
              >
                📥 Descargar PDF Oficial
            </DescargarPDFButton>
            </div>

            {/* Botón 2: Convertir a Nota de Venta */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">🧾 Nota de Venta (Descuenta stock)</p>
              {!convertido ? (
                <button
                  onClick={convertirANotaVenta}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {loading ? "Convirtiendo..." : "Convertir a Nota de Venta"}
                </button>
              ) : (
                <button
                  onClick={descargarNotaVenta}
                  className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-green-800 transition"
                >
                  <FileText className="h-4 w-4" />
                  Descargar Nota de Venta (NV-000{notaVentaId})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}