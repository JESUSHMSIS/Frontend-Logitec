"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTransporte,
  useUpdateTransporte,
} from "@/hooks/useTransportes";

interface TransporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transporteToEdit?: {
    id: string;
    tipo: string;
    capacidadCBM: number;
    estado: string;
    imagen?: string;
  };
}

export default function TransporteModal({
  open,
  onOpenChange,
  transporteToEdit,
}: TransporteModalProps) {
  const [tipo, setTipo] = useState("");
  const [capacidadCBM, setCapacidadCBM] = useState("");
  const [estado, setEstado] = useState<"DISPONIBLE" | "NO_DISPONIBLE">(
    "DISPONIBLE"
  );
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const createTransporteMutation = useCreateTransporte();
  const updateTransporteMutation = useUpdateTransporte();

  useEffect(() => {
    if (transporteToEdit) {
      setTipo(transporteToEdit.tipo);
      setCapacidadCBM(transporteToEdit.capacidadCBM.toString());
      setEstado(transporteToEdit.estado as "DISPONIBLE" | "NO_DISPONIBLE");
      if (transporteToEdit.imagen) {
        setPreviewUrl(transporteToEdit.imagen);
      }
    }
  }, [transporteToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("capacidadCBM", capacidadCBM);
    formData.append("estado", estado);
    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      if (transporteToEdit) {
        await updateTransporteMutation.mutateAsync({
          id: transporteToEdit.id,
          data: formData,
        });
      } else {
        await createTransporteMutation.mutateAsync(formData);
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setTipo("");
    setCapacidadCBM("");
    setEstado("DISPONIBLE");
    setImagen(null);
    setPreviewUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle>
            {transporteToEdit ? "Editar Transporte" : "Nuevo Transporte"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Transporte</Label>
            <Input
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacidadCBM">Capacidad CBM</Label>
            <Input
              id="capacidadCBM"
              type="number"
              value={capacidadCBM}
              onChange={(e) => setCapacidadCBM(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={estado}
              onValueChange={(value: "DISPONIBLE" | "NO_DISPONIBLE") =>
                setEstado(value)
              }
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                <SelectItem value="NO_DISPONIBLE">No Disponible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imagen">Imagen</Label>
            <Input
              id="imagen"
              type="file"
              onChange={handleImageChange}
              className="bg-gray-800 border-gray-700 text-white"
              accept="image/*"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-[200px] rounded-lg"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-500"
              disabled={
                createTransporteMutation.isPending ||
                updateTransporteMutation.isPending
              }
            >
              {createTransporteMutation.isPending ||
              updateTransporteMutation.isPending
                ? "Guardando..."
                : transporteToEdit
                ? "Actualizar"
                : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
