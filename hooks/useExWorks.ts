import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExWork, CreateExWorkDto } from "@/services/exworks";
import { ExWorks } from "./useProformas";

// Hook para crear un nuevo exwork
export function useCreateExWork(options?: { onSuccess?: (data: ExWorks) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exWorkData: CreateExWorkDto) => createExWork(exWorkData),
    onSuccess: (data) => {
      // Invalidar la caché de proformas para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
      
      // Llamar al callback onSuccess si se proporcionó
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}