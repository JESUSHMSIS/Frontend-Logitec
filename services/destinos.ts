import axios from "axios";
import { Destino } from "@/hooks/useProformas";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Función para obtener todos los destinos (almacenes)
export const fetchDestinos = async (): Promise<Destino[]> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await axios.get(`${API_URL}/almacenes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener destinos:", error);
    throw error;
  }
};
