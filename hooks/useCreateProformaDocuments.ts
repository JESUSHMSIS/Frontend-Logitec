import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface DocumentoRequest {
  proformaId: string;
  tipo:
    | "FACTURA_COMERCIAL"
    | "PERMISO_IMPORTACION"
    | "LISTA_EMPAQUE"
    | "CERTIFICADO_ORIGEN"
    | "CERTIFICADO_INSPECCION"
    | "OTRO";
  nombre: string;
  descripcion: string;
  comentarios: string;
  requisitos: string[];
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documento: DocumentoRequest) => {
      const { data } = await axios.post(
        "http://localhost:5173/api/documentos-aduaneros",
        documento
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Documento creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};
