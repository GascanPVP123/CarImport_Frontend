import { Card, CardContent } from "@/components/ui/card";
import { ClienteData } from "@/types/cotizacion";

interface DatosClienteCardProps {
  cliente: ClienteData;
}

export function DatosClienteCard({ cliente }: DatosClienteCardProps) {
  return (
    <Card className="rounded-none border border-[#E5E7EB] shadow-none">
      <CardContent className="p-3 space-y-1 text-xs font-medium text-gray-800">
        <div className="grid grid-cols-[80px_1fr] gap-x-2">
          <span className="text-gray-500 font-semibold">Nombre :</span>
          <span className="text-gray-900">{cliente.nombre}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-x-2">
          <span className="text-gray-500 font-semibold">RUC :</span>
          <span className="text-gray-900">{cliente.ruc}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-x-2">
          <span className="text-gray-500 font-semibold">Dirección :</span>
          <span className="text-gray-900">{cliente.direccion}</span>
        </div>
      </CardContent>
    </Card>
  );
}