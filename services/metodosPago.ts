import axios from "axios";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Interfaz para los métodos de pago
export interface MetodoPago {
  id: string;
  nombre: string;
  porcentajeExtra: number;
  _count?: {
    exWorks: number;
  };
}

// Función para obtener todos los métodos de pago
export const fetchMetodosPago = async (): Promise<MetodoPago[]> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await axios.get(`${API_URL}/metodos-pago`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    throw error;
  }
};