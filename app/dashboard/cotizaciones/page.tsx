"use client";

import React, { useEffect, useState } from "react";
import { productoService, Producto } from "@/services/productoService";
import { cotizacionService, CotizacionInput } from "@/services/cotizacionService";
import { Plus, Trash2, FileText, User, ShoppingBag } from "lucide-react";
import { DescargarPDFButton } from "@/components/cotizacion/DescargarPDFButton";
import { FacturaCabeceraTable } from "@/components/cotizacion/FacturaCabeceraTable";
import { ClienteData, CotizacionItem, FacturaCabecera } from "@/types/cotizacion";

interface CarritoItem {
  id: number;
  codigoSku: string;
  nombre: string;
  precioVenta: number;
  cantidad: number;
  stockDisponible: number;
  unidadMedida: string;
}

interface CotizacionEmitidaData {
  id: number;
  cliente: ClienteData;
  cabecera: FacturaCabecera;
  horaEmision: string;
  items: CotizacionItem[];
  totalNeto: number;
}

export default function NuevaCotizacionPage() {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string>("");
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [unidadInput, setUnidadInput] = useState<string>("unid");

  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cotizacionEmitida, setCotizacionEmitida] = useState<CotizacionEmitidaData | null>(null);

  // Estado para la cabecera de factura
  const [cabeceraFactura, setCabeceraFactura] = useState<FacturaCabecera>({
    fechaEmision: new Date().toLocaleDateString("es-PE"),
    fechaVencimiento: new Date().toLocaleDateString("es-PE"),
    condicionPago: "CONTADO",
    moneda: "SOLES",
  });

  useEffect(() => {
    productoService
      .listar()
      .then((data) => {
        setProductos(data);
        if (data.length > 0 && data[0].id) {
          setProductoSeleccionadoId(data[0].id.toString());
          setUnidadInput(data[0].unidadMedida || "unid");
        }
      })
      .catch((err: unknown) => {
        const mensaje = err instanceof Error ? err.message : "Error desconocido";
        console.error("Error al sincronizar productos:", mensaje);
      });
  }, []);

  const agregarAlCarrito = () => {
    if (!productoSeleccionadoId) return;

    const prodReal = productos.find((p) => p.id?.toString() === productoSeleccionadoId);
    if (!prodReal || !prodReal.id) return;

    if (prodReal.stock < cantidadInput) {
      alert(
        `No puedes solicitar ${cantidadInput} unidades. El stock actual en MySQL es de ${prodReal.stock}.`
      );
      return;
    }

    const unidadFinal = unidadInput.trim() === "" ? "unid" : unidadInput.trim();
    const skuReal = prodReal.codigoSku || "N/A";

    const existe = carrito.find((item) => item.id === prodReal.id);

    if (existe) {
      const nuevaCantidad = existe.cantidad + cantidadInput;
      if (prodReal.stock < nuevaCantidad) {
        alert(`La cantidad total supera el stock disponible (${prodReal.stock} uds).`);
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item.id === prodReal.id
            ? { ...item, cantidad: nuevaCantidad, unidadMedida: unidadFinal }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          id: prodReal.id,
          codigoSku: skuReal,
          nombre: prodReal.nombre,
          precioVenta: prodReal.precioVenta,
          cantidad: cantidadInput,
          stockDisponible: prodReal.stock,
          unidadMedida: unidadFinal,
        },
      ]);
    }
    setCantidadInput(1);
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const totalNeto = carrito.reduce((sum, item) => sum + item.precioVenta * item.cantidad, 0);

  // Convertir carrito a items de cotización para el PDF
  const itemsParaPDF = (): CotizacionItem[] => {
    return carrito.map((item, index) => ({
      item: index + 1,
      codigo: item.codigoSku,
      cantidad: item.cantidad,
      unidad: item.unidadMedida,
      descripcion: item.nombre,
      precioVenta: item.precioVenta,
      importe: item.precioVenta * item.cantidad,
    }));
  };

  const manejarEnviarCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre || carrito.length === 0) {
      alert("Por favor, ingresa los datos del cliente y añade mínimo un repuesto.");
      return;
    }

    setLoading(true);

    const ahora = new Date();
    const horaExactaStr = ahora.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const payload: CotizacionInput = {
      clienteNombre,
      clienteDocumento,
      detalles: carrito.map((item) => ({
        cantidad: item.cantidad,
        producto: { id: item.id },
        precioUnitario: item.precioVenta,
      })),
    };

    try {
      const exito = await cotizacionService.guardar(payload);
      alert(`¡Cotización N° ${exito.id} emitida con éxito!`);

      const clienteData: ClienteData = {
        nombre: clienteNombre,
        ruc: clienteDocumento || "N/A",
        direccion: clienteDireccion || "N/A",
        telefono: clienteTelefono || "N/A",
      };

      setCotizacionEmitida({
        id: exito.id,
        cliente: clienteData,
        cabecera: cabeceraFactura,
        horaEmision: horaExactaStr,
        items: itemsParaPDF(),
        totalNeto,
      });

      setClienteNombre("");
      setClienteDocumento("");
      setClienteDireccion("");
      setCarrito([]);

      // Resetear cabecera
      setCabeceraFactura({
        fechaEmision: new Date().toLocaleDateString("es-PE"),
        fechaVencimiento: new Date().toLocaleDateString("es-PE"),
        condicionPago: "CONTADO",
        moneda: "SOLES",
      });

      const nuevoInventario = await productoService.listar();
      setProductos(nuevoInventario);
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : "Error desconocido";
      console.error(error);
      alert(`Error: ${mensaje || "No se pudo procesar la cotización."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Generar Cotización 📄</h1>
        <p className="text-slate-500 text-sm">
          Panel de cotización rápida sin descuentos ni impuestos adicionales.
        </p>
      </div>

      <form onSubmit={manejarEnviarCotizacion} className="space-y-6">
        {/* Información del Cliente */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 text-slate-700 font-bold text-sm">
            <User className="h-4 w-4 text-emerald-600" />
            <span>Información del Cliente</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nombre / Razón Social
              </label>
              <input
                type="text"
                required
                className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ej. Taller Mecánico Silva"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                RUC o DNI (Opcional)
              </label>
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ej. 20123456789"
                value={clienteDocumento}
                onChange={(e) => setClienteDocumento(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Dirección
              </label>
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ej. Av. Los Olivos 123"
                value={clienteDireccion}
                onChange={(e) => setClienteDireccion(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ej. 987 654 321"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 🔥 TABLA DE CABECERA DE FACTURA (FECHA, VENCIMIENTO, CONDICIÓN, MONEDA) */}
        <div className="bg-white border border-slate-200 rounded-none shadow-none">
          <FacturaCabeceraTable cabecera={cabeceraFactura} />
        </div>

        {/* Selección de productos */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 text-slate-700 font-bold text-sm">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span>Seleccionar Autopartes de Importación</span>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Buscar Producto
              </label>
              <select
                className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={productoSeleccionadoId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setProductoSeleccionadoId(newId);
                  const prod = productos.find((p) => p.id?.toString() === newId);
                  setUnidadInput(prod?.unidadMedida || "unid");
                }}
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.codigoSku}] {p.nombre} (Stock: {p.stock} | S/.{" "}
                    {p.precioVenta.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-2.5 text-sm border rounded-lg text-center font-bold"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Unidad
              </label>
              <input
                type="text"
                className="w-full p-2.5 text-sm border rounded-lg text-center font-mono"
                value={unidadInput}
                onChange={(e) => setUnidadInput(e.target.value)}
                placeholder="unid"
              />
            </div>
            <button
              type="button"
              onClick={agregarAlCarrito}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir Fila</span>
            </button>
          </div>
        </div>

        {/* Tabla de Cotización */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Descripción de Autoparte</th>
                <th className="px-6 py-4 text-center">Unidad</th>
                <th className="px-6 py-4 text-center">Cantidad</th>
                <th className="px-6 py-4 text-right">P. Unitario</th>
                <th className="px-6 py-4 text-right">Importe</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {carrito.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    La lista de cotización está vacía.
                  </td>
                </tr>
              ) : (
                carrito.map((item) => {
                  const importeItem = item.precioVenta * item.cantidad;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                        {item.codigoSku}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{item.nombre}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-mono text-xs">
                        {item.unidadMedida}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{item.cantidad}</td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        S/. {item.precioVenta.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        S/. {importeItem.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition"
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

          {carrito.length > 0 && (
            <div className="bg-slate-50/80 px-6 py-4 border-t flex justify-end">
              <span className="text-lg font-bold text-slate-900">
                Total: S/. {totalNeto.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading || carrito.length === 0}
            className="flex inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:bg-slate-200 disabled:text-slate-400 shadow-sm text-sm"
          >
            <FileText className="h-4 w-4" />
            <span>{loading ? "Registrando en MySQL..." : "Emitir Cotización Oficial"}</span>
          </button>
        </div>
      </form>

      {/* Descarga del PDF */}
      {cotizacionEmitida && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-sm font-bold text-emerald-900">¡Cotización generada con éxito!</p>
            <p className="text-xs text-emerald-700">
              Cotización N° #000{cotizacionEmitida.id} emitida a las {cotizacionEmitida.horaEmision}.
            </p>
          </div>

          <DescargarPDFButton
            cotizacionId={cotizacionEmitida.id}
            cliente={cotizacionEmitida.cliente}
            cabecera={cotizacionEmitida.cabecera}
            items={cotizacionEmitida.items}
            fechaEmision={cotizacionEmitida.cabecera.fechaEmision}
            horaEmision={cotizacionEmitida.horaEmision}
            fileName={`Cotizacion_Nro_${cotizacionEmitida.id}.pdf`}
          />
        </div>
      )}
    </div>
  );
}