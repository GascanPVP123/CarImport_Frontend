import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CotizacionItem } from "@/types/cotizacion";

interface CotizacionTableProps {
  items: CotizacionItem[];
}

export function CotizacionTable({ items }: CotizacionTableProps) {
  return (
    <div className="border border-[#E5E7EB] rounded-none overflow-hidden">
      <Table className="text-xs">
        <TableHeader>
          <TableRow className="bg-[#E5E7EB] hover:bg-[#E5E7EB] border-b border-[#E5E7EB]">
            <TableHead className="w-[40px] text-center font-bold text-gray-600 py-1.5">
              ITEM
            </TableHead>
            <TableHead className="w-[90px] font-bold text-gray-600 py-1.5">
              CÓDIGO
            </TableHead>
            <TableHead className="w-[50px] text-center font-bold text-gray-600 py-1.5">
              CANT.
            </TableHead>
            <TableHead className="w-[50px] text-center font-bold text-gray-600 py-1.5">
              UNID
            </TableHead>
            <TableHead className="font-bold text-gray-600 py-1.5">
              DESCRIPCIÓN
            </TableHead>
            <TableHead className="w-[90px] text-right font-bold text-gray-600 py-1.5">
              P. VENTA
            </TableHead>
            <TableHead className="w-[90px] text-right font-bold text-gray-600 py-1.5">
              IMPORTE
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                No hay productos en esta cotización
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.item} className="border-b border-[#E5E7EB] hover:bg-gray-50/50">
                <TableCell className="text-center font-mono text-gray-600 py-1">
                  {item.item}
                </TableCell>
                <TableCell className="font-mono text-gray-700 py-1">
                  {item.codigo}
                </TableCell>
                <TableCell className="text-center text-gray-700 py-1">
                  {item.cantidad}
                </TableCell>
                <TableCell className="text-center text-gray-500 py-1">
                  {item.unidad}
                </TableCell>
                <TableCell className="text-gray-800 py-1">
                  {item.descripcion}
                </TableCell>
                <TableCell className="text-right font-mono text-gray-700 py-1">
                  {item.precioVenta.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-gray-900 py-1">
                  {item.importe.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}