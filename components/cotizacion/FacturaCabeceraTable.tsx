import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacturaCabecera } from "@/types/cotizacion";

interface FacturaCabeceraTableProps {
  cabecera: FacturaCabecera;
}

export function FacturaCabeceraTable({ cabecera }: FacturaCabeceraTableProps) {
  return (
    <div className="w-full mt-2 mb-2">
      <Table className="text-xs border border-[#D1D5DB] rounded-none">
        <TableHeader>
          <TableRow className="bg-[#D9D9D9] hover:bg-[#D9D9D9] border-b border-[#D1D5DB]">
            <TableHead className="text-center font-bold text-gray-700 py-1.5 border-r border-[#D1D5DB]">
              FECHA EMISIÓN
            </TableHead>
            <TableHead className="text-center font-bold text-gray-700 py-1.5 border-r border-[#D1D5DB]">
              FECHA VENCIMIENTO
            </TableHead>
            <TableHead className="text-center font-bold text-gray-700 py-1.5 border-r border-[#D1D5DB]">
              CONDICIÓN DE PAGO
            </TableHead>
            <TableHead className="text-center font-bold text-gray-700 py-1.5">
              MONEDA
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-b border-[#D1D5DB] hover:bg-white">
            <TableCell className="text-center text-gray-800 py-1.5 border-r border-[#D1D5DB]">
              {cabecera.fechaEmision}
            </TableCell>
            <TableCell className="text-center text-gray-800 py-1.5 border-r border-[#D1D5DB]">
              {cabecera.fechaVencimiento}
            </TableCell>
            <TableCell className="text-center text-gray-800 py-1.5 border-r border-[#D1D5DB]">
              {cabecera.condicionPago}
            </TableCell>
            <TableCell className="text-center text-gray-800 py-1.5">
              {cabecera.moneda}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}