import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useProformaDocuments,
  useUpdateDocumentoEstado,
} from "@/hooks/useProformaDocuments";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateRequisito } from "@/hooks/useProformaDocuments";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

interface ProformaDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  proformaId: string | null;
}

export function CompletarRequisitosModal({
  proformaId,
  open,
  onClose,
}: ProformaDocumentsModalProps) {
  const queryClient = useQueryClient();
  const {
    data: documents,
    isLoading,
    isError,
    error,
  } = useProformaDocuments(proformaId);
  const { mutate: updateRequisito } = useUpdateRequisito();
  const { mutate: updateDocumentoEstado } = useUpdateDocumentoEstado();

  const handleRequisitoChange = async (
    documentoId: string,
    requisitoId: string,
    checked: boolean
  ) => {
    try {
      await updateRequisito({
        documentoId,
        requisitoId,
        completado: checked,
        proformaId: proformaId!, // Añadir proformaId
      });
    } catch (error) {
      console.error("Error actualizando requisito:", error);
    }
  };

  const handleDocumentoCheckboxChange = async (
    documentoId: string,
    checked: boolean,
    requisitos: any[] // Add requisitos as a parameter
  ) => {
    const newEstado = checked ? "COMPLETADO" : "PENDIENTE";
    updateDocumentoEstado({
      documentoId: documentoId,
      estado: newEstado,
      comentarios: "",
    });

    // If the document checkbox is checked, mark all requirements as completed
    if (checked) {
      for (const req of requisitos) {
        if (!req.completado) {
          await updateRequisito({
            documentoId: documentoId,
            requisitoId: req.id,
            completado: true,
            proformaId: proformaId!,
          });
        }
      }
    } else {
      // If the document checkbox is unchecked, mark all requirements as pending
      for (const req of requisitos) {
        if (req.completado) {
          await updateRequisito({
            documentoId: documentoId,
            requisitoId: req.id,
            completado: false,
            proformaId: proformaId!,
          });
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Estado de Documentos de Proforma</DialogTitle>
          <DialogDescription className="text-gray-400">
            Verifica el estado de los documentos asociados a esta proforma.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border border-gray-700 p-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-gray-700" />
              <Skeleton className="h-12 w-full bg-gray-700" />
              <Skeleton className="h-12 w-full bg-gray-700" />
            </div>
          )}
          {isError && (
            <p className="text-red-500">
              Error al cargar documentos: {error?.message}
            </p>
          )}
          {documents && documents.length === 0 && (
            <p className="text-gray-400">
              No hay documentos asociados a esta proforma.
            </p>
          )}
          {documents &&
            documents?.map((doc) => (
              <div
                key={doc.id}
                className="mb-4 p-3 border border-gray-600 rounded-lg bg-gray-750"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={doc.estado === "COMPLETADO"}
                      onCheckedChange={(checked) => {
                        handleDocumentoCheckboxChange(
                          doc.id,
                          checked,
                          doc.requisitos
                        );
                      }}
                      className="h-5 w-5 border-gray-500"
                    />
                    <h3 className="text-lg font-semibold">{doc.nombre}</h3>
                  </div>
                  <Badge
                    variant={
                      doc.estado === "APROBADO" ? "default" : "secondary"
                    }
                  >
                    {doc.estado}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-1">Tipo: {doc.tipo}</p>
                {doc.archivoUrl && (
                  <a
                    href={doc.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mb-2 block"
                  >
                    Ver Archivo
                  </a>
                )}
                {doc.comentarios && (
                  <p className="text-xs text-gray-500 italic mb-2">
                    Comentarios: {doc.comentarios}
                  </p>
                )}
                <h4 className="text-md font-medium mt-3 mb-1">Requisitos:</h4>
                {doc.requisitos.length > 0 ? (
                  <ul className="space-y-2">
                    {doc.requisitos.map((req) => (
                      <li
                        key={req.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Checkbox
                          id={`req-${req.id}`}
                          checked={req.completado}
                          onCheckedChange={(checked: boolean) =>
                            handleRequisitoChange(doc.id, req.id, checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <label
                          htmlFor={`req-${req.id}`}
                          className={`flex-1 ${
                            req.completado
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {req.descripcion}
                          <span className="block text-xs text-gray-400 mt-1">
                            {req.completado
                              ? `Completado el ${new Date(
                                  req.fechaCompletado!
                                ).toLocaleDateString()}`
                              : "Pendiente"}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">
                    No hay requisitos específicos para este documento.
                  </p>
                )}
              </div>
            ))}
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompletarRequisitosModal;
