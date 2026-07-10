"use client";

import { CotizacionPDFProps } from "@/types/cotizacion";
import { CotizacionPDF } from "@/components/cotizacion/CotizacionPDF";

interface DescargarPDFButtonProps {
  cotizacionId: number;
  cliente: CotizacionPDFProps["cliente"];
  cabecera: CotizacionPDFProps["cabecera"];
  items: CotizacionPDFProps["items"];
  fechaEmision: string;
  horaEmision: string;
  fileName: string;
}

export function DescargarPDFButton({
  cotizacionId,
  cliente,
  cabecera,
  items,
  fechaEmision,
  horaEmision,
  fileName,
}: DescargarPDFButtonProps) {
  const handleDescargarPDF = async () => {
    const { pdf } = await import("@react-pdf/renderer");

    const blob = await pdf(
      <CotizacionPDF
        id={cotizacionId}
        cliente={cliente}
        cabecera={cabecera}
        items={items}
        fechaEmision={fechaEmision}
        horaEmision={horaEmision}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDescargarPDF}
      className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm"
    >
      📥 Descargar PDF Oficial
    </button>
  );
}