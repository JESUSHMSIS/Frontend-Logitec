import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransportes,
  fetchTransportesTable,
  createTransporte,
  updateTransporte,
  deleteTransporte,
  type TransportesTableParams,
  type CreateTransporteDto,
  type UpdateTransporteDto,
} from "@/services/transportes";
import { Transporte } from "./useProformas";
import { useToast } from "@/components/ui/use-toast";

// Hook para obtener todos los transportes
export function useTransportes() {
  return useQuery<Transporte[], Error>({
    queryKey: ["transportes"],
    queryFn: fetchTransportes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook para obtener transportes paginados y filtrados
export function useTransportesTable(params?: TransportesTableParams) {
  return useQuery({
    queryKey: ["transportesTable", params],
    queryFn: () => fetchTransportesTable(params || {}),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear un nuevo transporte
export function useCreateTransporte() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateTransporteDto) => createTransporte(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportes"] });
      queryClient.invalidateQueries({ queryKey: ["transportesTable"] });
      toast({
        title: "Transporte creado",
        description: "El transporte ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear el transporte",
      });
    },
  });
}

// Hook para actualizar un transporte
export function useUpdateTransporte() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransporteDto }) =>
      updateTransporte(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportes"] });
      queryClient.invalidateQueries({ queryKey: ["transportesTable"] });
      toast({
        title: "Transporte actualizado",
        description: "El transporte ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el transporte",
      });
    },
  });
}

// Hook para eliminar un transporte
export function useDeleteTransporte() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteTransporte(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportes"] });
      queryClient.invalidateQueries({ queryKey: ["transportesTable"] });
      toast({
        title: "Transporte eliminado",
        description: "El transporte ha sido eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el transporte",
      });
    },
  });
}
