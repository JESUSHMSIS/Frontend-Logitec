import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProductoExWork,
  CreateProductoExWorkDto,
} from "@/services/productosExWork";
import { Producto } from "./useProformas";

// Hook para crear un nuevo producto ExWork
export function useCreateProductoExWork(options?: {
  onSuccess?: (data: Producto) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productoData: CreateProductoExWorkDto) =>
      createProductoExWork(productoData),
    onSuccess: (data) => {
      // Invalidar la caché de proformas para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
      console.log("Producto creado con éxito:", data);
      // Llamar al callback onSuccess si se proporcionó
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
