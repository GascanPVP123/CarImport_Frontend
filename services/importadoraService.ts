import { apiRequest } from "./api";

export interface Importadora {
  id: number;
  ruc: string;
  razonSocial: string;
  telefono?: string;
}


export const importadoraService = {
  listar: () => apiRequest<Importadora[]>("/importadoras", { method: "GET" }),

  guardar: (importadora: Omit<Importadora, "id">) =>
    apiRequest<Importadora>("/importadoras", {
      method: "POST",
      body: importadora,
    }),

  // ✅ Agregar este método
  actualizar: (id: number, importadora: Importadora) =>
    apiRequest<Importadora>(`/importadoras/${id}`, {
      method: "PUT",
      body: importadora,
    }),

  eliminar: (id: number) =>
    apiRequest<void>(`/importadoras/${id}`, { method: "DELETE" }),
};