import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

export interface Grupo {
  id: string;
  nombre: string;
  transporteId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "DISPONIBLE" | "NO_DISPONIBLE";
  cbmDisponible: number;
  createdAt: string;
  updatedAt: string;
  transporte: {
    id: string;
    tipo: string;
    capacidadCBM: number;
    imagen: string;
    estado: string;
    activo: boolean;
    usuarioId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  proformas: any[];
}

export interface CreateGrupoDto {
  nombre: string;
  transporteId: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface UpdateGrupoDto {
  nombre?: string;
  transporteId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: "DISPONIBLE" | "NO_DISPONIBLE";
}

export interface GruposTableParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export interface PaginatedGrupos {
  data: Grupo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchGrupos = async (): Promise<Grupo[]> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.get(`${API_URL}/grupos-transporte`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    throw error;
  }
};

export const fetchGruposTable = async (
  params: GruposTableParams
): Promise<PaginatedGrupos> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.get(`${API_URL}/grupos-transporte`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener tabla de grupos:", error);
    throw error;
  }
};

export const createGrupo = async (
  grupoData: CreateGrupoDto
): Promise<Grupo> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.post(
      `${API_URL}/grupos-transporte`,
      grupoData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al crear grupo:", error);
    throw error;
  }
};

export const updateGrupo = async (
  id: string,
  updateData: UpdateGrupoDto
): Promise<Grupo> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    const response = await axios.patch(
      `${API_URL}/grupos-transporte/${id}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al actualizar grupo:", error);
    throw error;
  }
};

export const deleteGrupo = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No hay token de autenticación");

    await axios.delete(`${API_URL}/grupos-transporte/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    throw error;
  }
};
