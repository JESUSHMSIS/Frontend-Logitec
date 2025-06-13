import axios from "axios";
import { Transporte } from "@/hooks/useProformas";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

export interface CreateTransporteDto {
  tipo: string;
  capacidadCBM: number;
  imagen?: string;
  estado: "DISPONIBLE" | "NO_DISPONIBLE";
  activo: boolean;
}

export interface UpdateTransporteDto {
  tipo?: string;
  capacidadCBM?: number;
  imagen?: string;
  estado?: "DISPONIBLE" | "NO_DISPONIBLE";
  activo?: boolean;
}

export interface TransportesTableParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export interface PaginatedTransportes {
  data: Transporte[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Función para obtener todos los transportes
export const fetchTransportes = async (): Promise<Transporte[]> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.get(`${API_URL}/transportes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("transportes",response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener transportes:", error);
    throw error;
  }
};

// Función para obtener transportes paginados y filtrados
export const fetchTransportesTable = async (
  params: TransportesTableParams
): Promise<PaginatedTransportes> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.get(`${API_URL}/transportes/table`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener tabla de transportes:", error);
    throw error;
  }
};

// Función para crear un nuevo transporte
export const createTransporte = async (
  transporteData: CreateTransporteDto
): Promise<Transporte> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.post(`${API_URL}/transportes`, transporteData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error al crear transporte:", error);
    throw error;
  }
};

// Función para actualizar un transporte
export const updateTransporte = async (
  id: string,
  updateData: UpdateTransporteDto
): Promise<Transporte> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.patch(`${API_URL}/transportes/${id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error al actualizar transporte:", error);
    throw error;
  }
};

// Función para eliminar un transporte
export const deleteTransporte = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    await axios.delete(`${API_URL}/transportes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error al eliminar transporte:", error);
    throw error;
  }
};