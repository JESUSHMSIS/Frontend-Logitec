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
  ProformaDocument,
} from "@/hooks/useProformaDocuments";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProformaDocumentsModalProps {
  open: boolean; // Cambiado de isOpen a open
  onClose: () => void;
  proformaId: string | null;
}

const ProformaDocumentsModal: React.FC<ProformaDocumentsModalProps> = ({
  open, // Cambiado de isOpen a open
  onClose,
  proformaId,
}) => {
  const {
    data: documents,
    isLoading,
    isError,
    error,
  } = useProformaDocuments(proformaId!, { enabled: open && !!proformaId });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETADO":
        return "success";
      case "PENDIENTE":
        return "warning";
      case "RECHAZADO":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Estado de Documentos de Proforma</DialogTitle>
          <DialogDescription>
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
            <p>No hay documentos asociados a esta proforma.</p>
          )}
          {documents &&
            documents.map((doc) => (
              <div
                key={doc.id}
                className="mb-4 p-3 border border-gray-600 rounded-lg bg-gray-750"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{doc.nombre}</h3>
                  <Badge>{doc.estado}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-1">Tipo: {doc.tipo}</p>
                <p className="text-sm text-gray-300 mb-2">{doc.descripcion}</p>
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
                  <ul className="list-disc pl-5 space-y-1">
                    {doc.requisitos.map((req) => (
                      <li
                        key={req.id}
                        className={`text-sm ${
                          req.completado ? "text-green-400" : "text-yellow-400"
                        }`}
                      >
                        {req.descripcion} -{" "}
                        {req.completado
                          ? `Completado (${new Date(
                              req.fechaCompletado!
                            ).toLocaleDateString()})`
                          : "Pendiente"}
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
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-gray-600 hover:bg-gray-500 border-gray-500"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProformaDocumentsModal;
