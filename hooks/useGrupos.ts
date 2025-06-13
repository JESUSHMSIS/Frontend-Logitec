import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGrupos,
  fetchGruposTable,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  type GruposTableParams,
  type CreateGrupoDto,
  type UpdateGrupoDto,
  type Grupo,
} from "@/services/grupos";
import { useToast } from "@/components/ui/use-toast";

export function useGrupos() {
  return useQuery<Grupo[], Error>({
    queryKey: ["grupos"],
    queryFn: fetchGrupos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGruposTable(params: GruposTableParams) {
  return useQuery({
    queryKey: ["gruposTable", params],
    queryFn: () => fetchGruposTable(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGrupo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateGrupoDto) => createGrupo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
      queryClient.invalidateQueries({ queryKey: ["gruposTable"] });
      toast({
        title: "Grupo creado",
        description: "El grupo ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear el grupo",
      });
    },
  });
}

export function useUpdateGrupo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGrupoDto }) =>
      updateGrupo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
      queryClient.invalidateQueries({ queryKey: ["gruposTable"] });
      toast({
        title: "Grupo actualizado",
        description: "El grupo ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el grupo",
      });
    },
  });
}

export function useDeleteGrupo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
      queryClient.invalidateQueries({ queryKey: ["gruposTable"] });
      toast({
        title: "Grupo eliminado",
        description: "El grupo ha sido eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el grupo",
      });
    },
  });
}
