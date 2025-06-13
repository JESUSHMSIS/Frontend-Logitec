import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Proforma } from "./useProformas";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Interfaz para los parámetros de paginación y filtrado
export interface ProformasTableParams {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// Interfaz para la respuesta paginada
export interface PaginatedProformas {
  data: Proforma[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Función para obtener las proformas paginadas
const fetchProformasTable = async (
  params: ProformasTableParams
): Promise<PaginatedProformas> => {
  try {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams();
    queryParams.append("page", params.page.toString());
    queryParams.append("limit", params.limit.toString());

    if (params.startDate) {
      queryParams.append("startDate", params.startDate.toISOString());
    }

    if (params.endDate) {
      queryParams.append("endDate", params.endDate.toISOString());
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    const response = await axios.get(
      `${API_URL}/proformas?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al obtener proformas:", error);
    throw error;
  }
};

// Hook personalizado para obtener las proformas paginadas
export function useProformasTable(params: ProformasTableParams) {
  return useQuery({
    queryKey: ["proformasTable", params],
    queryFn: () => fetchProformasTable(params),
    keepPreviousData: true, // Mantener los datos anteriores mientras se cargan los nuevos
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
