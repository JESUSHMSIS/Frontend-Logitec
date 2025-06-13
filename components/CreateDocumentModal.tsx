import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// Cambiar esta línea de importación
import { useCreateDocument } from "@/hooks/useCreateProformaDocuments";
import { X, Plus } from "lucide-react";

interface CreateDocumentModalProps {
  proformaId: string;
  open: boolean;
  onClose: () => void;
}

const TIPOS_DOCUMENTO = [
  { value: "PERMISO_IMPORTACION", label: "Permiso de importacion" },
  { value: "FACTURA_COMERCIAL", label: "Factura comercial" },
  { value: "LISTA_EMPAQUE", label: "Lista de empaque" },
  { value: "CERTIFICADO_ORIGEN", label: "Certificado de Origen" },
  { value: "CERTIFICADO_INSPECCION", label: "Certificado de Inspeccion" },
  { value: "OTRO", label: "Otro" },
];

export function CreateDocumentModal({
  proformaId,
  open,
  onClose,
}: CreateDocumentModalProps) {
  const [tipo, setTipo] = useState<string>("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [requisitos, setRequisitos] = useState<string[]>([""]);

  const { mutate: createDocument, isPending } = useCreateDocument();

  const handleAddRequisito = () => {
    setRequisitos([...requisitos, ""]);
  };

  const handleRemoveRequisito = (index: number) => {
    setRequisitos(requisitos.filter((_, i) => i !== index));
  };

  const handleRequisitoChange = (index: number, value: string) => {
    const newRequisitos = [...requisitos];
    newRequisitos[index] = value;
    setRequisitos(newRequisitos);
  };

  const handleSubmit = () => {
    const formattedRequisitos = requisitos
      .filter(Boolean)
      .map(descripcion => ({ descripcion }));

    createDocument(
      {
        proformaId,
        tipo: tipo as any,
        nombre,
        descripcion,
        comentarios,
        requisitos: formattedRequisitos,
      },
      {
        onSuccess: () => {
          onClose();
          // Reset form
          setTipo("");
          setNombre("");
          setDescripcion("");
          setComentarios("");
          setRequisitos([""]);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Tipo de Documento</label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Nombre</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Descripción</label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Comentarios</label>
            <Textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Requisitos</label>
            {requisitos.map((requisito, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={requisito}
                  onChange={(e) => handleRequisitoChange(index, e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRequisito(index)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddRequisito}
              className="w-full mt-2 border-gray-600 hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Requisito
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Creando..." : "Crear Documento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
