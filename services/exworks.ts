import axios from "axios";
import { ExWorks } from "@/hooks/useProformas";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Interfaz para la creación de exworks
export interface CreateExWorkDto {
  proformaId: string;
  metodoPagoId: string;
  controlCalidad: boolean;
  costoEnvioAlmacen: number;
  gastosDespacho: number;
  gastosDesconsolidacion: number;
  otrosGastos: number;
  enlaceCompra?: string;
}

// Función para crear un nuevo exwork
export const createExWork = async (
  exWorkData: CreateExWorkDto
): Promise<ExWorks> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await axios.post(`${API_URL}/exworks`, exWorkData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("ExWork creado:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear exwork:", error);
    throw error;
  }
};
