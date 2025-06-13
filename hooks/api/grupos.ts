"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  GrupoAPI,
  CreateGrupoRequest,
  UpdateGrupoRequest,
  GrupoFilters,
  PaginatedResponse,
  SolicitarUnirseRequest,
  SolicitudGrupo,
} from "@/types/api";
import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173";

// Query Keys
export const gruposKeys = {
  all: ["grupos"] as const,
  lists: () => [...gruposKeys.all, "list"] as const,
  list: (filters: GrupoFilters) => [...gruposKeys.lists(), filters] as const,
  details: () => [...gruposKeys.all, "detail"] as const,
  detail: (id: string) => [...gruposKeys.details(), id] as const,
  solicitudes: () => [...gruposKeys.all, "solicitudes"] as const,
};

// API Functions
const gruposApi = {
  // Obtener lista de grupos
  getGrupos: async (
    filters: GrupoFilters = {}
  ): Promise<PaginatedResponse<GrupoAPI>> => {
    const { data } = await apiClient.get("/grupos-transporte", {
      params: {
        ...filters,
        limit: undefined, // Asegurarnos de que no se aplique ningún límite
      },
    });
    return data;
  },

  // Obtener grupo por ID
  getGrupo: async (id: string): Promise<GrupoAPI> => {
    const { data } = await apiClient.get(`/grupos-transporte/${id}`);
    return data;
  },

  // Crear nuevo grupo
  createGrupo: async (grupo: CreateGrupoRequest): Promise<GrupoAPI> => {
    const { data } = await apiClient.post("/grupos-transporte", grupo);
    return data.data;
  },

  // Actualizar grupo
  updateGrupo: async ({
    id,
    ...updates
  }: UpdateGrupoRequest & { id: string }): Promise<GrupoAPI> => {
    const { data } = await apiClient.put(`/grupos/${id}`, updates);
    return data.data;
  },

  // Eliminar grupo
  deleteGrupo: async (id: string): Promise<void> => {
    await apiClient.delete(`/grupos-transporte/${id}`);
  },

  // Solicitar unirse a grupo
  solicitarUnirse: async (
    solicitud: SolicitarUnirseRequest
  ): Promise<SolicitudGrupo> => {
    const { data } = await apiClient.post(
      "/grupos/solicitar-unirse",
      solicitud
    );
    return data.data;
  },

  // Aprobar/rechazar solicitud
  gestionarSolicitud: async ({
    id,
    estado,
  }: {
    id: string;
    estado: "APROBADA" | "RECHAZADA";
  }): Promise<SolicitudGrupo> => {
    const { data } = await apiClient.put(`/solicitudes/${id}`, { estado });
    return data.data;
  },

  // Obtener solicitudes pendientes (para admin)
  getSolicitudes: async (
    filters: { estado?: string } = {}
  ): Promise<SolicitudGrupo[]> => {
    const { data } = await apiClient.get("/solicitudes", { params: filters });
    return data.data;
  },
};

// Custom Hooks
export function useGrupos(filters: GrupoFilters = {}) {
  return useQuery({
    queryKey: gruposKeys.list(filters),
    queryFn: () => gruposApi.getGrupos(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGrupo(id: string) {
  return useQuery({
    queryKey: gruposKeys.detail(id),
    queryFn: () => gruposApi.getGrupo(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutos para detalles
  });
}

export function useCreateGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gruposApi.createGrupo,
    onSuccess: (newGrupo) => {
      // Invalidar y actualizar cache
      queryClient.invalidateQueries({ queryKey: gruposKeys.lists() });

      // Optimistic update - agregar el nuevo grupo al cache
      queryClient.setQueryData<PaginatedResponse<GrupoAPI>>(
        gruposKeys.list({}),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [newGrupo, ...old.data],
            total: old.total + 1,
          };
        }
      );
    },
    onError: (error) => {
      console.error("Error al crear grupo:", error);
    },
  });
}

export function useUpdateGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gruposApi.updateGrupo,
    onSuccess: (updatedGrupo) => {
      // Actualizar cache del grupo específico
      queryClient.setQueryData(
        gruposKeys.detail(updatedGrupo.id),
        updatedGrupo
      );

      // Invalidar listas para refrescar
      queryClient.invalidateQueries({ queryKey: gruposKeys.lists() });
    },
    onError: (error) => {
      console.error("Error al actualizar grupo:", error);
    },
  });
}

export function useDeleteGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gruposApi.deleteGrupo,
    onSuccess: (_, deletedId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: gruposKeys.detail(deletedId) });

      // Actualizar listas
      queryClient.setQueriesData<PaginatedResponse<GrupoAPI>>(
        { queryKey: gruposKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((grupo) => grupo.id !== deletedId),
            total: old.total - 1,
          };
        }
      );
    },
    onError: (error) => {
      console.error("Error al eliminar grupo:", error);
    },
  });
}

export function useSolicitarUnirse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gruposApi.solicitarUnirse,
    onSuccess: (_, variables) => {
      // Invalidar grupo específico para actualizar solicitudes
      queryClient.invalidateQueries({
        queryKey: gruposKeys.detail(variables.grupoId),
      });

      // Invalidar lista de solicitudes para admin
      queryClient.invalidateQueries({ queryKey: gruposKeys.solicitudes() });
    },
    onError: (error) => {
      console.error("Error al solicitar unirse:", error);
    },
  });
}

export function useGestionarSolicitud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gruposApi.gestionarSolicitud,
    onSuccess: (solicitudActualizada) => {
      // Invalidar todas las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: gruposKeys.solicitudes() });
      queryClient.invalidateQueries({ queryKey: gruposKeys.lists() });

      // Actualizar grupo específico si tenemos el ID
      if (solicitudActualizada.grupoId) {
        queryClient.invalidateQueries({
          queryKey: gruposKeys.detail(solicitudActualizada.grupoId),
        });
      }
    },
    onError: (error) => {
      console.error("Error al gestionar solicitud:", error);
    },
  });
}

export function useSolicitudes(filters: { estado?: string } = {}) {
  return useQuery({
    queryKey: [...gruposKeys.solicitudes(), filters],
    queryFn: () => gruposApi.getSolicitudes(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}




export const useAprobarSolicitud = () => {
  return useMutation({
    mutationFn: async ({ solicitudId, comentario }: { solicitudId: string; comentario?: string }) => {
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173";
      const url = `${baseUrl}/api/grupos-transporte/solicitud/${solicitudId}/aprobar`;

      const response = await axios.patch(url, {
        comentario: comentario || "Solicitud aprobada",
      });

      return response.data;
    },
  });
};




export const useRechazarSolicitud = () => {
  return useMutation({
    mutationFn: async ({ solicitudId, comentario }: { solicitudId: string; comentario?: string }) => {
      const url = `${baseUrl}/api/grupos-transporte/solicitud/${solicitudId}/rechazar`;

      const response = await axios.patch(url, {
        comentario: comentario || "Solicitud rechazada",
      });

      return response.data;
    },
  });
};
