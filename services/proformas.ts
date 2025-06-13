import axios from "axios";
import { Proforma } from "@/hooks/useProformas";
import { useQuery } from "@tanstack/react-query";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Interfaz para la creación de proformas
export interface CreateProformaDto {
  nombre: string;
  transporteId: string;
  destinoId: string;
  usuarioId: string;
}

// Función para crear una nueva proforma
export const createProforma = async (
  proformaData: CreateProformaDto
): Promise<Proforma> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await axios.post(`${API_URL}/proformas`, proformaData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear proforma:", error);
    throw error;
  }
};

// Interfaz para la solicitud de aprobación
export interface SolicitarAprobacionDto {
  comentario: string;
}

// Función para solicitar la aprobación de una proforma
export const solicitarAprobacion = async (
  proformaId: string,
  data: SolicitarAprobacionDto
): Promise<any> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await axios.post(
      `${API_URL}/proformas/${proformaId}/solicitar-aprobacion`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al solicitar aprobación:", error);
    throw error;
  }
};
