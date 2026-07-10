import { CotizacionItem } from "@/types/cotizacion";

interface CotizacionTotalFooterProps {
  items: CotizacionItem[];
}

export function CotizacionTotalFooter({ items }: CotizacionTotalFooterProps) {
  const total = items.reduce((sum, item) => sum + item.importe, 0);

  return (
    <div className="flex justify-end border border-[#E5E7EB] border-t-0 bg-gray-50/50 px-3 py-1.5">
      <div className="grid grid-cols-[80px_100px] gap-x-2 text-xs font-bold">
        <span className="text-gray-600 text-right">TOTAL S/</span>
        <span className="text-right font-mono text-gray-900">
          {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}