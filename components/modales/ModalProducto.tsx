"use client";

import React, { useEffect, useState } from "react";
import { X, Package, DollarSign, Tag, Layers, Hash, Building2, Plus, Pencil } from "lucide-react";
import { Producto } from "@/services/productoService";
import { importadoraService, Importadora } from "@/services/importadoraService";

interface ModalProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (producto: Producto) => Promise<void>;
  productoEditar?: Producto | null;
}

const OPCIONES_UNIDAD = ["unidad", "par", "docena", "pack", "caja"] as const;

export function ModalProducto({
  isOpen,
  onClose,
  onGuardar,
  productoEditar,
}: ModalProductoProps) {
  const [importadoras, setImportadoras] = useState<Importadora[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsj, setErrorMsj] = useState<string | null>(null);

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editandoImportadora, setEditandoImportadora] = useState<Importadora | null>(null);
  const [guardandoImp, setGuardandoImp] = useState(false);
  const [formImp, setFormImp] = useState({ ruc: "", razonSocial: "", telefono: "" });
  const [errorImp, setErrorImp] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    const cargarImportadoras = async () => {
      try {
        const data = await importadoraService.listar();
        if (!ignore) setImportadoras(data);
      } catch (e) {
        console.error("Error al cargar importadoras:", e);
      }
    };

    cargarImportadoras();

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalProductoInner
      key={productoEditar?.id ?? "nuevo"}
      productoEditar={productoEditar}
      onClose={onClose}
      onGuardar={onGuardar}
      importadoras={importadoras}
      loading={loading}
      setLoading={setLoading}
      errorMsj={errorMsj}
      setErrorMsj={setErrorMsj}
      subModalOpen={subModalOpen}
      setSubModalOpen={setSubModalOpen}
      editandoImportadora={editandoImportadora}
      setEditandoImportadora={setEditandoImportadora}
      guardandoImp={guardandoImp}
      setGuardandoImp={setGuardandoImp}
      formImp={formImp}
      setFormImp={setFormImp}
      errorImp={errorImp}
      setErrorImp={setErrorImp}
      setImportadoras={setImportadoras}
    />
  );
}

function ModalProductoInner({
  productoEditar,
  onClose,
  onGuardar,
  importadoras,
  loading,
  setLoading,
  errorMsj,
  setErrorMsj,
  subModalOpen,
  setSubModalOpen,
  editandoImportadora,
  setEditandoImportadora,
  guardandoImp,
  setGuardandoImp,
  formImp,
  setFormImp,
  errorImp,
  setErrorImp,
  setImportadoras,
}: {
  productoEditar: Producto | null | undefined;
  onClose: () => void;
  onGuardar: (producto: Producto) => Promise<void>;
  importadoras: Importadora[];
  loading: boolean;
  setLoading: (v: boolean) => void;
  errorMsj: string | null;
  setErrorMsj: (v: string | null) => void;
  subModalOpen: boolean;
  setSubModalOpen: (v: boolean) => void;
  editandoImportadora: Importadora | null;
  setEditandoImportadora: (v: Importadora | null) => void;
  guardandoImp: boolean;
  setGuardandoImp: (v: boolean) => void;
  formImp: { ruc: string; razonSocial: string; telefono: string };
  setFormImp: (v: { ruc: string; razonSocial: string; telefono: string }) => void;
  errorImp: string | null;
  setErrorImp: (v: string | null) => void;
  setImportadoras: React.Dispatch<React.SetStateAction<Importadora[]>>;
}) {
  const [form, setForm] = useState<Producto>(() => ({
    id: productoEditar?.id,
    codigoSku: productoEditar?.codigoSku || "",
    nombre: productoEditar?.nombre || "",
    descripcion: productoEditar?.descripcion || "",
    stock: productoEditar?.stock ?? 0,
    precioCompra: productoEditar?.precioCompra ?? 0,
    precioMenor: productoEditar?.precioMenor ?? productoEditar?.precioVenta ?? 0,
    precioMayor: productoEditar?.precioMayor ?? 0,
    unidadMedida: productoEditar?.unidadMedida || "unidad",
    importadoraId: productoEditar?.importadora?.id ?? productoEditar?.importadoraId ?? null,
  }));

  const handleGuardarImportadora = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorImp(null);

    if (!formImp.ruc.trim() || !formImp.razonSocial.trim()) {
      setErrorImp("El RUC y la Razón Social son obligatorios.");
      return;
    }

    try {
      setGuardandoImp(true);

      let result: Importadora;

      if (editandoImportadora?.id) {
        // ✅ Actualizar existente
        result = await importadoraService.actualizar(editandoImportadora.id, {
          id: editandoImportadora.id,
          ruc: formImp.ruc.trim(),
          razonSocial: formImp.razonSocial.trim(),
          telefono: formImp.telefono.trim(),
        });
        setImportadoras((prev) => prev.map((i) => (i.id === result.id ? result : i)));
      } else {
        // ✅ Crear nueva
        result = await importadoraService.guardar({
          ruc: formImp.ruc.trim(),
          razonSocial: formImp.razonSocial.trim(),
          telefono: formImp.telefono.trim(),
        });
        setImportadoras((prev) => [...prev, result]);
      }

      setForm((prev) => ({ ...prev, importadoraId: result.id }));
      setFormImp({ ruc: "", razonSocial: "", telefono: "" });
      setEditandoImportadora(null);
      setSubModalOpen(false);
    } catch (err: unknown) {
      setErrorImp(err instanceof Error ? err.message : "Error al guardar la importadora.");
    } finally {
      setGuardandoImp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsj(null);

    const productoParaGuardar: Producto = {
      ...form,
      importadora: form.importadoraId
        ? importadoras.find((imp) => imp.id === form.importadoraId) || null
        : null,
    };

    if (!form.codigoSku.trim() || !form.nombre.trim()) {
      setErrorMsj("El código SKU y el nombre son obligatorios.");
      return;
    }

    if (form.precioMenor <= 0) {
      setErrorMsj("El precio al menor debe ser mayor a 0.");
      return;
    }

    try {
      setLoading(true);
      await onGuardar(productoParaGuardar);
      onClose();
    } catch (err: unknown) {
      setErrorMsj(err instanceof Error ? err.message : "Error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">

          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-400" />
              <h2 className="font-bold text-base">
                {productoEditar ? "Editar Producto" : "Nuevo Producto"}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition rounded-lg p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsj && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                {errorMsj}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-gray-400" /> SKU / Código *
                </label>
                <input type="text" required value={form.codigoSku} onChange={(e) => setForm({ ...form, codigoSku: e.target.value })} placeholder="Ej: FILT-TOY-01" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-gray-400" /> Unidad Medida
                </label>
                <select value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} className="w-full p-2.5 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  {OPCIONES_UNIDAD.map((u) => (
                    <option key={u} value={u}>{u.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-gray-400" /> Nombre del Producto *
              </label>
              <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Filtro de Aceite Toyota Hilux" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>

            {/* ✅ Selector de Importadora con Editar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" /> Importadora
                </label>
                <div className="flex gap-2">
                  {form.importadoraId && (
                    <button
                      type="button"
                      onClick={() => {
                        const imp = importadoras.find((i) => i.id === form.importadoraId);
                        if (imp) {
                          setFormImp({
                            ruc: imp.ruc || "",
                            razonSocial: imp.razonSocial || "",
                            telefono: imp.telefono || "",
                          });
                          setEditandoImportadora(imp);
                          setSubModalOpen(true);
                        }
                      }}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormImp({ ruc: "", razonSocial: "", telefono: "" });
                      setEditandoImportadora(null);
                      setSubModalOpen(true);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Nueva
                  </button>
                </div>
              </div>

              <select
                value={form.importadoraId || ""}
                onChange={(e) => setForm({ ...form, importadoraId: e.target.value ? Number(e.target.value) : null })}
                className="w-full p-2.5 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Sin importadora asignada --</option>
                {importadoras.map((imp) => (
                  <option key={imp.id} value={imp.id}>
                    {imp.razonSocial} (RUC: {imp.ruc})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Especificaciones o notas adicionales..." className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-amber-600" /> P. Compra (S/)
                </label>
                <input type="number" step="0.01" min="0" value={form.precioCompra === 0 ? "" : form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="w-full p-2 text-sm border rounded-lg font-mono font-semibold bg-amber-50/50 text-amber-900 border-amber-200 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> P. Menor (S/) *
                </label>
                <input type="number" step="0.01" min="0" required value={form.precioMenor === 0 ? "" : form.precioMenor} onChange={(e) => setForm({ ...form, precioMenor: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="w-full p-2 text-sm border rounded-lg font-mono font-semibold bg-emerald-50/50 text-emerald-900 border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-blue-600" /> P. Mayor (S/)
                </label>
                <input type="number" step="0.01" min="0" value={form.precioMayor === 0 ? "" : form.precioMayor} onChange={(e) => setForm({ ...form, precioMayor: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="w-full p-2 text-sm border rounded-lg font-mono font-semibold bg-blue-50/50 text-blue-900 border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">Stock Inicial *</label>
                <input type="number" min="0" required value={form.stock === 0 ? "" : form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full p-2 text-sm border rounded-lg font-mono text-center focus:ring-2 focus:ring-slate-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:bg-gray-300">
                {loading ? "Guardando..." : productoEditar ? "Actualizar Producto" : "Guardar Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Sub-modal para Crear/Editar Importadora */}
      {subModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-150">
            <div className={`flex items-center justify-between px-4 py-3 ${editandoImportadora ? "bg-amber-600" : "bg-emerald-700"} text-white`}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="font-bold text-sm">
                  {editandoImportadora ? "Editar Importadora" : "Registrar Importadora"}
                </h3>
              </div>
              <button type="button" onClick={() => setSubModalOpen(false)} className="text-white/70 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarImportadora} className="p-4 space-y-3">
              {errorImp && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">{errorImp}</div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Número RUC *</label>
                <input type="text" required maxLength={11} value={formImp.ruc} onChange={(e) => setFormImp({ ...formImp, ruc: e.target.value })} placeholder="Ej: 20601234567" className="w-full p-2 text-xs border rounded focus:ring-2 focus:ring-emerald-500 font-mono" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Razón Social / Nombre *</label>
                <input type="text" required value={formImp.razonSocial} onChange={(e) => setFormImp({ ...formImp, razonSocial: e.target.value })} placeholder="Ej: Importadora Perú SAC" className="w-full p-2 text-xs border rounded focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Teléfono <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input type="text" value={formImp.telefono} onChange={(e) => setFormImp({ ...formImp, telefono: e.target.value })} placeholder="Ej: 987654321" className="w-full p-2 text-xs border rounded focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setSubModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={guardandoImp} className={`px-4 py-1.5 text-xs font-semibold text-white rounded hover:opacity-90 disabled:bg-gray-300 ${editandoImportadora ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  {guardandoImp ? "Guardando..." : editandoImportadora ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}