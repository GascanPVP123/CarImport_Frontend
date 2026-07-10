const API_URL = "http://127.0.0.1:8080/api/cotizaciones";

export interface DetalleCotizacionInput {
  cantidad: number;
  producto: {
    id: number;
  };
}

export interface CotizacionInput {
  clienteNombre: string;
  clienteDocumento: string;
  detalles: DetalleCotizacionInput[];
}

export interface DetalleCotizacionResponse {
  id: number;
  cantidad: number;
  precioUnitario: number;
  producto: {
    id: number;
    codigoSku: string;
    nombre: string;
    precioVenta: number;
  };
}

export interface CotizacionResponse {
  id: number;
  clienteNombre: string;
  clienteDocumento: string;
  fecha: string;
  total: number;
  detalles: DetalleCotizacionResponse[];
}

export const cotizacionService = {
  // POST: Enviar la nueva cotización y descontar stock
  guardar: async (cotizacion: CotizacionInput): Promise<CotizacionResponse> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cotizacion),
    });

    if (!response.ok) {
      const msgError = await response.text();
      throw new Error(msgError || "Error al procesar la cotización. Revisa el stock.");
    }

    return response.json();
  },

  // GET: Traer el historial completo si lo necesitas después
  listar: async (): Promise<CotizacionResponse[]> => {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Error al obtener el historial");
    return response.json();
  },
};