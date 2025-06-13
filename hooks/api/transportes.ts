"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Transporte, CreateTransporteRequest } from "@/types/api";

// Query Keys
export const transportesKeys = {
  all: ["transportes"] as const,
  lists: () => [...transportesKeys.all, "list"] as const,
  list: (filters: any) => [...transportesKeys.lists(), filters] as const,
  disponibles: () => [...transportesKeys.all, "disponibles"] as const,
};

// API Functions
const transportesApi = {
  getTransportes: async (filters: any = {}) => {
    const { data } = await apiClient.get("/transportes", { params: filters });
    return data.data;
  },

  getTransportesDisponibles: async (): Promise<Transporte[]> => {
    const { data } = await apiClient.get("/transportes");
    return data.data;
  },

  createTransporte: async (
    transporte: CreateTransporteRequest
  ): Promise<Transporte> => {
    const formData = new FormData();

    Object.entries(transporte).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });

    const { data } = await apiClient.post("/transportes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.data;
  },
};

// Custom Hooks
export function useTransportes(filters: any = {}) {
  return useQuery({
    queryKey: transportesKeys.list(filters),
    queryFn: () => transportesApi.getTransportes(filters),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useCreateTransporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transportesApi.createTransporte,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportesKeys.all });
    },
    onError: (error) => {
      console.error("Error al crear transporte:", error);
    },
  });
}

export function useAllTransport() {
  return useQuery({
    queryKey: transportesKeys.lists(),
    queryFn: async () => {
      const response = await transportesApi.getTransportes();
      return response || []; // Aseguramos que siempre devuelva un array
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
