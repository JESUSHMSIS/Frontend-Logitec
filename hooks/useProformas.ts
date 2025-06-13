import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  createProforma,
  CreateProformaDto,
  solicitarAprobacion,
} from "@/services/proformas";

// Definición de tipos basados en la respuesta de la API
export interface Producto {
  id: string;
  descripcion: string;
  hsCode: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  totalCbm: number;
  imagen: string | null;
  exWorksId: string;
  tributoId: string;
}

export interface ExWorks {
  id: string;
  proformaId: string;
  enlaceCompra: string | null;
  metodoPagoId: string;
  controlCalidad: boolean;
  costoEnvioAlmacen: number;
  gastosDespacho: number;
  gastosDesconsolidacion: number;
  otrosGastos: number;
  createdAt: string;
  productos: Producto[];
}

export interface Transporte {
  id: string;
  tipo: string;
}

export interface Destino {
  id: string;
  pais: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  ci: string;
  telefono: string;
  nombreEmpresa: string;
  activo: boolean;
  tipoUsuarioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proforma {
  id: string;
  nombre: string;
  transporteId: string;
  destinoId: string;
  cbmTotal: number;
  precioCBM: number;
  createdAt: string;
  usuarioId: string;
  estadoAprobacion: "PENDIENTE" | "APROBADO" | "RECHAZADO " | "SOLICITADA";
  comentarioAprobacion: string | null;
  exWorks: ExWorks[];
  transporte: Transporte;
  destino: Destino;
  usuario: Usuario;
}

// URL base de la API (ajusta según tu configuración)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

// Función para obtener las proformas del usuario
const fetchProformas = async (usuarioId: string): Promise<Proforma[]> => {
  try {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await axios.get(
      `${API_URL}/proformas/usuario/${usuarioId}`,
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

// Hook personalizado para obtener las proformas
export function useProformas(usuarioId: string) {
  return useQuery({
    queryKey: ["proformas", usuarioId],
    queryFn: () => fetchProformas(usuarioId),
    enabled: !!usuarioId, // Solo ejecutar si hay un ID de usuario
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

// Función para adaptar proformas al formato de cotizaciones
export function adaptProformasToCotizaciones(proformas: Proforma[]): any[] {
  return proformas.map((proforma) => ({
    id: proforma.id,
    nombre: proforma.nombre,
    pais: proforma.destino.pais,
    transporte: proforma.transporte?.tipo?.toLowerCase(),
    fecha: new Date(proforma.createdAt).toLocaleString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    cbm: proforma.cbmTotal,
    precioCBM: proforma.precioCBM,
    estadoAprobacion: proforma.estadoAprobacion,
    exWorks: proforma.exWorks.length > 0,
  }));
}

// Hook para crear una nueva proforma
export function useCreateProforma(options?: {
  onSuccess?: (data: Proforma) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proformaData: CreateProformaDto) =>
      createProforma(proformaData),
    onSuccess: (data) => {
      // Invalidar la caché de proformas para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ["proformas"] });

      // Llamar al callback onSuccess si se proporcionó
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}

// Importar la función de solicitar aprobación

// Hook para solicitar aprobación de una proforma
export function useSolicitarAprobacion(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proformaId,
      comentario,
    }: {
      proformaId: string;
      comentario: string;
    }) => solicitarAprobacion(proformaId, { comentario }),
    onSuccess: (data) => {
      // Invalidar la caché de proformas para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
      queryClient.invalidateQueries({ queryKey: ["proformaDetail"] });

      // Llamar al callback onSuccess si se proporcionó
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}
