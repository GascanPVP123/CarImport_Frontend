import { toast } from "sonner";

export const useToast = () => {
  return {
    success: (mensaje: string, descripcion?: string) =>
      toast.success(mensaje, { description: descripcion }),

    error: (mensaje: string, descripcion?: string) =>
      toast.error(mensaje, { description: descripcion }),

    warning: (mensaje: string, descripcion?: string) =>
      toast.warning(mensaje, { description: descripcion }),

    info: (mensaje: string, descripcion?: string) =>
      toast.info(mensaje, { description: descripcion }),

    loading: (mensaje: string) =>
      toast.loading(mensaje),

    promise: <T,>(
      promesa: Promise<T>,
      mensajes: { loading: string; success: string; error: string }
    ) =>
      toast.promise(promesa, {
        loading: mensajes.loading,
        success: mensajes.success,
        error: mensajes.error,
      }),

    custom: toast,
  };
};