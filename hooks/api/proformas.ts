"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiClient } from "@/lib/api-client";


const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173";
// Query Keys
export const proformasKeys = {
  all: ["proformas"] as const,
  lists: () => [...proformasKeys.all, "list"] as const,
  aprobadas: () => [...proformasKeys.all, "aprobadas"] as const,
};

// API Functions
const proformasApi = {
  getProformasAprobadas: async () => {
    // Obtener el ID del usuario del localStorage
    const usuarioStr = localStorage.getItem("usuarios");
    if (!usuarioStr) {
      throw new Error("No hay usuario autenticado");
    }
    const usuario = JSON.parse(usuarioStr);
    const usuarioId = usuario.id;

    // Obtener las proformas del usuario
    const { data } = await apiClient.get(`/proformas/usuario/${usuarioId}`);
    
    // Filtrar solo las proformas aprobadas
    const proformasAprobadas = data.filter(
      (proforma: any) => proforma.estadoAprobacion === "APROBADA"
    );

    return proformasAprobadas;
  },
};

// Custom Hooks
export const useProformasAprobadas = () => {
  
  return useQuery({
    queryKey: ["proformasAprobadas"],
    queryFn: async () => {
      // Obtener el ID del usuario del localStorage
      const userStr = localStorage.getItem("usuario");
      console.log(userStr);
      if (!userStr) {
        throw new Error("No hay usuario autenticado");
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id;

      const { data } = await axios.get(
        `${baseUrl}/api/proformas/usuario/${userId}`
      );

      // Filtrar solo las proformas aprobadas
      return data.filter((proforma: any) => proforma.estadoAprobacion === "APROBADA");
    },
  });
}; 


export const useSendProformasAprobada = (grupoId: string) => {
  return useMutation({
    mutationFn: async (proformaId: string) => {
      const url = `${baseUrl}/api/grupos-transporte/${grupoId}/solicitud`;

      const response = await axios.post(url, {
        proformaId,
        grupoId,
      });

      return response.data;
    },
  });
};