"use client";

import React, { useEffect, useState } from "react";
import { productoService, Producto } from "@/services/productoService";
import { cotizacionService, CotizacionRequest } from "@/services/cotizacionService";
import { clienteService, Cliente } from "@/services/clienteService";
import { Plus, Trash2, FileText, User, ShoppingBag, Calendar, Check, ChevronsUpDown } from "lucide-react";
import { ModalConfirmacion } from "@/components/modales/ModalConfirmacion";
import { ClienteData, CotizacionItem, FacturaCabecera } from "@/types/cotizacion";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ============================================================
// TIPOS E INTERFACES
// ============================================================
export type TipoPrecio = "MENOR" | "MAYOR" | "LIBRE";

interface CarritoItem {
  id: number;
  codigoSku: string;
  nombre: string;
  precioMenor: number;
  precioMayor: number;
  precioVenta: number;
  tipoPrecio: TipoPrecio;
  cantidad: number;
  stockDisponible: number;
  unidadMedida: string;
}

const OPCIONES_UNIDAD = ["unidad", "par", "doc", "pack", "caja"] as const;
type Unidad = (typeof OPCIONES_UNIDAD)[number];

const OPCIONES_PAGO = ["CONTADO", "CREDITO_15", "CREDITO_30", "CREDITO_45"] as const;
const OPCIONES_MONEDA = ["SOLES", "USD"] as const;

const normalizarUnidad = (unidad: string | undefined): Unidad => {
  if (unidad && OPCIONES_UNIDAD.includes(unidad as Unidad)) return unidad as Unidad;
  const lower = unidad?.toLowerCase();
  if (lower === "unid" || lower === "pza" || lower === "pieza") return "unidad";
  if (lower === "par" || lower === "pares") return "par";
  if (lower === "docena" || lower === "doc") return "doc";
  if (lower === "pack" || lower === "paquete") return "pack";
  if (lower === "caja" || lower === "cajas") return "caja";
  return "unidad";
};

// ============================================================
// COMPONENTE VISTA PREVIA
// ============================================================
const VistaPrevia: React.FC<{
  clienteNombre: string;
  clienteDocumento: string;
  clienteDireccion: string;
  clienteTelefono: string;
  cabecera: FacturaCabecera;
  carrito: CarritoItem[];
  totalNeto: number;
}> = ({ clienteNombre, clienteDocumento, clienteDireccion, clienteTelefono, cabecera, carrito, totalNeto }) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden" style={{ aspectRatio: "1/1.414" }}>
      <div className="p-4 h-full flex flex-col text-[10px] leading-tight text-gray-800">
        <div className="flex items-start justify-between border-b border-gray-300 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">LOGO</div>
            <div>
              <div className="font-bold text-xs text-gray-900">CAR IMPORT RAMOS & HUAMAN S.A.C.</div>
              <div className="text-[8px] text-gray-500">RUC 20123456789</div>
              <div className="text-[8px] text-gray-400">Av. Gerardo Unger 4485 Int. 16 - Lima</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[10px] text-gray-700">COTIZACIÓN</div>
            <div className="text-[9px] font-bold text-blue-900">COT-XXX-2026</div>
            <div className="text-[7px] text-gray-400">{cabecera.fechaEmision}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] border-b border-gray-200 pb-2 mb-2">
          <div><span className="font-semibold text-gray-500">Cliente:</span> {clienteNombre || "—"}</div>
          <div><span className="font-semibold text-gray-500">RUC/DNI:</span> {clienteDocumento || "—"}</div>
          <div><span className="font-semibold text-gray-500">Dirección:</span> {clienteDireccion || "—"}</div>
          <div><span className="font-semibold text-gray-500">Teléfono:</span> {clienteTelefono || "—"}</div>
          <div><span className="font-semibold text-gray-500">Fecha:</span> {cabecera.fechaEmision}</div>
          <div><span className="font-semibold text-gray-500">Moneda:</span> {cabecera.moneda}</div>
          <div><span className="font-semibold text-gray-500">Condición:</span> {cabecera.condicionPago}</div>
          <div><span className="font-semibold text-gray-500">Vigencia:</span> <span className="text-emerald-600 font-bold">Válido 7 días</span></div>
        </div>

        <div className="flex-1 overflow-hidden border border-gray-200 rounded mb-2">
          <div className="grid grid-cols-12 bg-gray-100 text-[8px] font-bold text-gray-600 uppercase border-b border-gray-200">
            <div className="col-span-1 px-1 py-1 text-center">ITEM</div>
            <div className="col-span-2 px-1 py-1">CÓDIGO</div>
            <div className="col-span-4 px-1 py-1">DESCRIPCIÓN</div>
            <div className="col-span-1 px-1 py-1 text-center">CANT</div>
            <div className="col-span-1 px-1 py-1 text-center">UND</div>
            <div className="col-span-1 px-1 py-1 text-right">P.U</div>
            <div className="col-span-2 px-1 py-1 text-right">IMPORTE</div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 18px)" }}>
            {carrito.length === 0 ? (
              <div className="text-[8px] text-gray-300 text-center py-8 italic">Sin productos</div>
            ) : (
              carrito.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="grid grid-cols-12 text-[8px] border-b border-gray-100">
                  <div className="col-span-1 px-1 py-0.5 text-center text-gray-500">{idx + 1}</div>
                  <div className="col-span-2 px-1 py-0.5 text-gray-600">{item.codigoSku}</div>
                  <div className="col-span-4 px-1 py-0.5 truncate">{item.nombre}</div>
                  <div className="col-span-1 px-1 py-0.5 text-center">{item.cantidad}</div>
                  <div className="col-span-1 px-1 py-0.5 text-center text-gray-500">{item.unidadMedida}</div>
                  <div className="col-span-1 px-1 py-0.5 text-right">{item.precioVenta.toFixed(2)}</div>
                  <div className="col-span-2 px-1 py-0.5 text-right font-semibold">{(item.precioVenta * item.cantidad).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-[9px] space-y-0.5 mb-1">
          <div className="flex justify-between font-bold text-[10px] border-t border-gray-300 pt-1">
            <span>TOTAL:</span><span>S/ {totalNeto.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-[7px] text-gray-400 leading-tight border-t border-gray-200 pt-1">
          <div>• Productos sujetos a disponibilidad de stock.</div>
          <div>• Precios incluyen IGV. • Cotización válida por 7 días.</div>
          <div className="flex justify-between mt-1">
            <span>BCP: 191-01945499-0-48</span>
            <span>Yape: 977 182 320</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function NuevaCotizacionPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string>("");
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [unidadInput, setUnidadInput] = useState<Unidad>("unidad");
  const [openCombobox, setOpenCombobox] = useState(false);

  const [carrito, setCarrito] = useState<CarritoItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("carrito");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [datosConfirmacion, setDatosConfirmacion] = useState<{
    cotizacionId: number;
    clienteId: number;
    cliente: ClienteData;
    cabecera: FacturaCabecera;
    items: CotizacionItem[];
    totalNeto: number;
    horaEmision: string;
  } | null>(null);

  const [cabeceraFactura, setCabeceraFactura] = useState<FacturaCabecera>({
    fechaEmision: new Date().toLocaleDateString("es-PE"),
    fechaVencimiento: new Date().toLocaleDateString("es-PE"),
    condicionPago: "CONTADO",
    moneda: "SOLES",
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    Promise.all([productoService.listar(), clienteService.listar()])
      .then(([productosData, clientesData]) => {
        setProductos(productosData);
        setClientes(clientesData);
        if (productosData.length > 0 && productosData[0].id) {
          setProductoSeleccionadoId(productosData[0].id.toString());
          setUnidadInput(normalizarUnidad(productosData[0].unidadMedida));
        }
      })
      .catch((err: unknown) => {
        console.error("Error al cargar datos:", err instanceof Error ? err.message : "Error desconocido");
      });
  }, []);

  // 🟢 FUNCIONES CONTROLADORAS DE PRECIOS
  const cambiarTipoPrecio = (index: number, nuevoTipo: TipoPrecio) => {
    setCarrito((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        let nuevoPrecio = item.precioVenta;
        if (nuevoTipo === "MENOR") nuevoPrecio = item.precioMenor;
        if (nuevoTipo === "MAYOR") nuevoPrecio = item.precioMayor;

        return {
          ...item,
          tipoPrecio: nuevoTipo,
          precioVenta: nuevoPrecio,
        };
      })
    );
  };

  const cambiarPrecioManual = (index: number, nuevoPrecio: number) => {
    setCarrito((prev) =>
      prev.map((item, i) => (i === index ? { ...item, tipoPrecio: "LIBRE", precioVenta: nuevoPrecio } : item))
    );
  };

  const cambiarCantidadFila = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    setCarrito((prev) =>
      prev.map((item, i) => (i === index ? { ...item, cantidad: nuevaCantidad } : item))
    );
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionadoId) return;
    const prodReal = productos.find((p) => p.id?.toString() === productoSeleccionadoId);
    if (!prodReal || !prodReal.id) return;

    const pMenor = prodReal.precioMenor ?? prodReal.precioVenta ?? 0;
    const pMayor = prodReal.precioMayor ?? prodReal.precioVenta ?? 0;
    const cantidadTotal = cantidadInput;
    const stockDisponible = prodReal.stock;

    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === prodReal.id);
      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidadTotal;
        if (stockDisponible < nuevaCantidad) {
          alert(`Stock insuficiente. Disponible: ${stockDisponible}, ya tienes ${existente.cantidad} en el carrito.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === prodReal.id
            ? { ...item, cantidad: nuevaCantidad, unidadMedida: unidadInput }
            : item
        );
      } else {
        if (stockDisponible < cantidadTotal) {
          alert(`Stock insuficiente. Disponible: ${stockDisponible}`);
          return prev;
        }
        return [
          ...prev,
          {
            id: prodReal.id as number,
            codigoSku: prodReal.codigoSku || "N/A",
            nombre: prodReal.nombre,
            precioMenor: pMenor,
            precioMayor: pMayor,
            precioVenta: pMenor,
            tipoPrecio: "MENOR",
            cantidad: cantidadTotal,
            stockDisponible: prodReal.stock,
            unidadMedida: unidadInput,
          },
        ];
      }
    });

    setCantidadInput(1);
  };

  const eliminarDelCarrito = (id: number) => setCarrito((prev) => prev.filter((item) => item.id !== id));

  const totalNeto = carrito.reduce((sum, item) => sum + item.precioVenta * item.cantidad, 0);

  const itemsParaPDF = (): CotizacionItem[] =>
    carrito.map((item, index) => ({
      item: index + 1,
      codigo: item.codigoSku,
      cantidad: item.cantidad,
      unidad: item.unidadMedida,
      descripcion: item.nombre,
      precioMenor: item.precioMenor,
      precioMayor: item.precioMayor,
      precioVenta: item.precioVenta,
      tipoPrecio: item.tipoPrecio,
      importe: item.precioVenta * item.cantidad,
      productoId: item.id,
    }));

  const manejarEnviarCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre || carrito.length === 0) {
      alert("Complete los datos del cliente y agregue al menos un producto.");
      return;
    }
    setLoading(true);
    const ahora = new Date();
    const horaExactaStr = ahora.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    try {
      const documentoLimpio = clienteDocumento.trim();
      let clienteId: number;

      if (documentoLimpio) {
        const clienteExistente = clientes.find((c) => c.documento === documentoLimpio);
        if (clienteExistente) {
          clienteId = clienteExistente.id!;
        } else {
          const nc = await clienteService.guardar({
            nombre: clienteNombre,
            documento: documentoLimpio,
            direccion: clienteDireccion || "",
            telefono: clienteTelefono || "",
          });
          clienteId = nc.id!;
          setClientes((prev) => [...prev, nc]);
        }
      } else {
        const nc = await clienteService.guardar({
          nombre: clienteNombre,
          documento: `TEMP-${Date.now()}`,
          direccion: clienteDireccion || "",
          telefono: clienteTelefono || "",
        });
        clienteId = nc.id!;
        setClientes((prev) => [...prev, nc]);
      }

      const payload: CotizacionRequest = {
        clienteId,
        fechaVencimiento: new Date().toISOString().split("T")[0],
        condicionPago: "CONTADO",
        moneda: "SOLES",
        observaciones: "",
        detalles: carrito.map((item) => ({
          productoId: item.id,
          cantidad: item.cantidad,
          unidad: item.unidadMedida || "unidad",
          precioUnitario: item.precioVenta,
          descuento: 0,
        })),
      };

      const exito = await cotizacionService.guardar(payload);

      setDatosConfirmacion({
        cotizacionId: exito.id,
        clienteId,
        cliente: {
          nombre: clienteNombre,
          ruc: documentoLimpio || "N/A",
          direccion: clienteDireccion || "N/A",
          telefono: clienteTelefono || "N/A",
        },
        cabecera: cabeceraFactura,
        items: itemsParaPDF(),
        totalNeto: exito.total,
        horaEmision: horaExactaStr,
      });

      setMostrarModal(true);
      setClienteNombre("");
      setClienteDocumento("");
      setClienteDireccion("");
      setClienteTelefono("");
      setCarrito([]);
      localStorage.removeItem("carrito");
    } catch (error: unknown) {
      alert(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Generar Cotización</h1>
        <p className="text-slate-500 text-sm">Complete los datos del cliente y agregue productos al detalle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={manejarEnviarCotizacion} className="lg:col-span-2 space-y-6">
          {/* PASO 1: DATOS DEL CLIENTE */}
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>Datos del Cliente</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                className="w-full p-2.5 text-sm border rounded-lg"
                placeholder="Nombre / Razón Social *"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg"
                placeholder="RUC / DNI"
                value={clienteDocumento}
                onChange={(e) => {
                  const doc = e.target.value;
                  setClienteDocumento(doc);
                  const hallado = clientes.find((c) => c.documento === doc.trim());
                  if (hallado) {
                    setClienteNombre(hallado.nombre);
                    setClienteDireccion(hallado.direccion || "");
                    setClienteTelefono(hallado.telefono || "");
                  }
                }}
              />
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg"
                placeholder="Dirección"
                value={clienteDireccion}
                onChange={(e) => setClienteDireccion(e.target.value)}
              />
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg"
                placeholder="Teléfono"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
              />
            </div>
          </div>

          {/* PASO 2: INFORMACIÓN DE LA COTIZACIÓN */}
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Información de la Cotización</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha Emisión</label>
                <input type="text" className="w-full p-2.5 text-sm border rounded-lg bg-gray-50" value={cabeceraFactura.fechaEmision} readOnly />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha Vencimiento</label>
                <input type="text" className="w-full p-2.5 text-sm border rounded-lg bg-gray-50" value={cabeceraFactura.fechaVencimiento} readOnly />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Condición de Pago</label>
                <select
                  className="w-full p-2.5 text-sm border rounded-lg bg-white"
                  value={cabeceraFactura.condicionPago}
                  onChange={(e) => setCabeceraFactura({ ...cabeceraFactura, condicionPago: e.target.value })}
                >
                  {OPCIONES_PAGO.map((op) => (
                    <option key={op} value={op}>{op.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
                <select
                  className="w-full p-2.5 text-sm border rounded-lg bg-white"
                  value={cabeceraFactura.moneda}
                  onChange={(e) => setCabeceraFactura({ ...cabeceraFactura, moneda: e.target.value })}
                >
                  {OPCIONES_MONEDA.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PASO 3: SELECCIONAR PRODUCTOS */}
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                <ShoppingBag className="h-4 w-4 text-gray-500" />
                <span>Seleccionar Productos</span>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger className="flex flex-1 min-w-[300px] items-center justify-between rounded-lg border border-input bg-background px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground h-10">
                  {productoSeleccionadoId ? (
                    (() => {
                      const prod = productos.find((p) => p.id?.toString() === productoSeleccionadoId);
                      const pMenor = prod?.precioMenor ?? prod?.precioVenta ?? 0;
                      const pMayor = prod?.precioMayor ?? prod?.precioVenta ?? 0;
                      return (
                        <span className="text-slate-700 font-medium truncate">
                          [{prod?.codigoSku}] {prod?.nombre} (Menor: S/ {pMenor.toFixed(2)} | Mayor: S/ {pMayor.toFixed(2)})
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-slate-400">Buscar producto por nombre o SKU...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Escribe el nombre o SKU..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandGroup>
                        {productos.map((p) => {
                          const pm = p.precioMenor ?? p.precioVenta ?? 0;
                          const pMa = p.precioMayor ?? p.precioVenta ?? 0;
                          return (
                            <CommandItem
                              key={p.id}
                              value={`${p.codigoSku} ${p.nombre}`}
                              onSelect={() => {
                                setProductoSeleccionadoId(p.id!.toString());
                                setUnidadInput(normalizarUnidad(p.unidadMedida));
                                setOpenCombobox(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", productoSeleccionadoId === p.id?.toString() ? "opacity-100" : "opacity-0")} />
                              <span className="text-xs">
                                [{p.codigoSku}] {p.nombre} (Stock: {p.stock} | Menor: S/ {pm.toFixed(2)} | Mayor: S/ {pMa.toFixed(2)})
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <input
                type="number"
                min="1"
                className="w-20 p-2 text-sm border rounded-lg text-center h-10"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(parseInt(e.target.value) || 1)}
              />
              <select
                className="w-24 p-2 text-sm border rounded-lg bg-white h-10"
                value={unidadInput}
                onChange={(e) => setUnidadInput(e.target.value as Unidad)}
              >
                {OPCIONES_UNIDAD.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={agregarAlCarrito}
                className="flex items-center gap-1 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition h-10"
              >
                <Plus className="h-4 w-4" /> Añadir Fila
              </button>
            </div>
          </div>

          {/* PASO 4: DETALLE DE LA COTIZACIÓN CON PRECIOS DINÁMICOS */}
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">4</div>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Detalle de la Cotización</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                    <th className="text-center py-2 font-semibold w-10">#</th>
                    <th className="text-left py-2 font-semibold">SKU</th>
                    <th className="text-left py-2 font-semibold">Descripción</th>
                    <th className="text-center py-2 font-semibold">Cant.</th>
                    <th className="text-center py-2 font-semibold">Unidad</th>
                    <th className="text-right py-2 font-semibold min-w-[150px]">Tipo / P. Unit.</th>
                    <th className="text-right py-2 font-semibold">Importe</th>
                    <th className="text-center py-2 font-semibold w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {carrito.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-300 italic text-sm">
                        Selecciona un producto y presiona Añadir Fila
                      </td>
                    </tr>
                  ) : (
                    carrito.map((item, index) => {
                      const importeItem = item.precioVenta * item.cantidad;
                      return (
                        <tr key={`${item.id}-${index}`} className="hover:bg-gray-50/50">
                          <td className="py-2 text-center font-mono text-xs text-gray-400">{index + 1}</td>
                          <td className="py-2 font-mono text-xs text-gray-600">{item.codigoSku}</td>
                          <td className="py-2 font-medium text-gray-900">{item.nombre}</td>
                          <td className="py-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad === 0 ? "" : item.cantidad}
                              onChange={(e) => cambiarCantidadFila(index, parseInt(e.target.value) || 1)}
                              className="w-14 text-center text-xs border rounded p-1"
                            />
                          </td>
                          <td className="py-2 text-center text-gray-500">{item.unidadMedida}</td>

                          {/* Selector de Tipo de Precio / Entrada Manual */}
                          <td className="py-2 text-right min-w-[160px]">
                            <div className="flex flex-col gap-1 items-end w-full">
                              <select
                                value={item.tipoPrecio}
                                onChange={(e) => cambiarTipoPrecio(index, e.target.value as TipoPrecio)}
                                className="text-[11px] border rounded px-1.5 py-0.5 bg-background text-foreground w-36 text-right cursor-pointer"
                              >
                                <option value="MENOR">P. Menor (S/ {(item.precioMenor ?? item.precioVenta ?? 0).toFixed(2)})</option>
                                <option value="MAYOR">P. Mayor (S/ {(item.precioMayor ?? item.precioVenta ?? 0).toFixed(2)})</option>
                                <option value="LIBRE">✏️ Oferta Libre</option>
                              </select>

                              {item.tipoPrecio === "LIBRE" ? (
                                <div className="flex items-center justify-end gap-1 w-36">
                                  <span className="text-xs text-gray-500 font-medium">S/</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={item.precioVenta}
                                    onChange={(e) => cambiarPrecioManual(index, parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right text-xs font-mono font-bold border border-amber-300 rounded px-1.5 py-0.5 bg-amber-50 focus:bg-white focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <span className="font-mono text-xs text-gray-700 font-semibold pr-1">
                                  S/ {item.precioVenta.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2 text-right font-semibold">S/ {importeItem.toFixed(2)}</td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => eliminarDelCarrito(item.id)}
                              className="text-gray-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {carrito.length > 0 && (
              <div className="flex justify-end border-t border-gray-200 pt-3">
                <span className="text-lg font-bold text-gray-900">Total: S/ {totalNeto.toFixed(2)}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || carrito.length === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition disabled:bg-gray-200 disabled:text-gray-400"
          >
            {loading ? "Emitiendo..." : "Emitir Cotización Oficial"}
          </button>
        </form>

        {/* VISTA PREVIA LATERAL */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Vista Previa — COT-XXX-2026
              </h3>
              <VistaPrevia
                clienteNombre={clienteNombre}
                clienteDocumento={clienteDocumento}
                clienteDireccion={clienteDireccion}
                clienteTelefono={clienteTelefono}
                cabecera={cabeceraFactura}
                carrito={carrito}
                totalNeto={totalNeto}
              />
            </div>
          </div>
        </div>
      </div>

      {mostrarModal && datosConfirmacion && (
        <ModalConfirmacion
          cotizacionId={datosConfirmacion.cotizacionId}
          cliente={datosConfirmacion.cliente}
          clienteId={datosConfirmacion.clienteId}
          cabecera={datosConfirmacion.cabecera}
          items={datosConfirmacion.items}
          totalNeto={datosConfirmacion.totalNeto}
          horaEmision={datosConfirmacion.horaEmision}
          onClose={() => {
            setMostrarModal(false);
            setDatosConfirmacion(null);
          }}
        />
      )}
    </div>
  );
}