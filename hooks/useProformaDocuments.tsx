import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Requisito {
  id: string;
  descripcion: string;
  completado: boolean;
  fechaCompletado: string | null;
}

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  archivoUrl: string | null;
  fechaActualizacion: string;
  porcentajeCompletado: number;
  requisitosCompletados: number;
  totalRequisitos: number;
  requisitos: Requisito[];
}

interface DocumentosResponse {
  documentos: Documento[];
}

export function useProformaDocuments(proformaId: string | null) {
  return useQuery<DocumentosResponse>({
    queryKey: ["proformaDocuments", proformaId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:5173/api/documentos-aduaneros/${proformaId}`
      );
      return response.data;
    },
    enabled: !!proformaId,
  });
}

export function useUpdateDocumentoEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentoId,
      estado,
      comentarios,
    }: {
      documentoId: string;
      estado: string;
      comentarios: string;
    }) => {
      const response = await axios.patch(
        `http://localhost:5173/api/documentos-aduaneros/${documentoId}`,
        { estado, comentarios }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Documento ${
          variables.estado === "COMPLETADO" ? "completado" : "actualizado"
        }`
      );
      // Invalidar todas las queries relacionadas con documentos
      queryClient.invalidateQueries({
        queryKey: ["proformaDocuments"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error("Error al actualizar el estado del documento");
      console.error("Error updating documento estado:", error);
    },
  });
}

export function useUpdateRequisito() {
  const queryClient = useQueryClient();
  const updateDocumentoEstado = useUpdateDocumentoEstado();

  return useMutation({
    mutationFn: async ({
      documentoId,
      requisitoId,
      completado,
      proformaId,
    }: {
      documentoId: string;
      requisitoId: string;
      completado: boolean;
      proformaId: string;
    }) => {
      // Primero actualizamos el requisito
      const response = await axios.patch(
        `http://localhost:5173/api/documentos-aduaneros/${documentoId}/requisito/${requisitoId}`,
        { completado }
      );

      // Obtener el estado actual del documento después de actualizar el requisito
      const documentoResponse = await axios.get(
        `http://localhost:5173/api/documentos-aduaneros/${documentoId}`
      );
      // const documento = documentoResponse.data;

      // // Verificar si todos los requisitos están completados
      // const todosCompletados = documento.requisitos.every(req => req.completado);

      // // Actualizar el estado del documento si es necesario
      // if (todosCompletados && documento.estado !== "COMPLETADO") {
      //   await updateDocumentoEstado.mutateAsync({
      //     documentoId,
      //     estado: "COMPLETADO",
      //     comentarios: "Todos los requisitos han sido completados"
      //   });
      // } else if (!todosCompletados && documento.estado === "COMPLETADO") {
      //   await updateDocumentoEstado.mutateAsync({
      //     documentoId,
      //     estado: "PENDIENTE",
      //     comentarios: "No todos los requisitos están completados"
      //   });
      // }

      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Requisito actualizado con exito");
      queryClient.invalidateQueries({
        queryKey: ["proformaDocuments", variables.proformaId],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error("Error al actualizar el requisito");
      console.error("Error updating requisito:", error);
    },
  });
}
