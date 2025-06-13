import axios from "axios";
import { Producto } from "@/hooks/useProformas";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Interfaz para la creación de productos ExWork
export interface CreateProductoExWorkDto {
  exWorksId: string;
  descripcion: string;
  hsCode: string;
  cantidad: number;
  precioUnitario: number;
  totalCbm: number;
  ga: number;
  iva: number;
  ice: number;
  file?: File; // Cambiado de imagen a file para manejar el archivo
}

// Función para crear un nuevo producto ExWork
export const createProductoExWork = async (
  productoData: CreateProductoExWorkDto
): Promise<Producto> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    // Crear un objeto FormData para enviar los datos y la imagen
    const formData = new FormData();
    
    // Agregar todos los campos al FormData
    formData.append("exWorksId", productoData.exWorksId);
    formData.append("descripcion", productoData.descripcion);
    formData.append("hsCode", productoData.hsCode);
    formData.append("cantidad", productoData.cantidad.toString());
    formData.append("precioUnitario", productoData.precioUnitario.toString());
    formData.append("totalCbm", productoData.totalCbm.toString());
    formData.append("ga", productoData.ga.toString());
    formData.append("iva", productoData.iva.toString());
    formData.append("ice", productoData.ice.toString());
    
    // Agregar el archivo de imagen si existe
    if (productoData.file) {
      formData.append("file", productoData.file);
    }

    const response = await axios.post(
      `${API_URL}/productos-exw`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // No establecer Content-Type, axios lo configurará automáticamente con el boundary correcto para FormData
        },
      }
    );
    console.log("Producto ExWork creado:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear producto ExWork:", error);
    throw error;
  }
};
