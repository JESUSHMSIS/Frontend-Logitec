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
import { useCreateGrupo, useUpdateGrupo } from "@/hooks/useGrupos";
import { useTransportes } from "@/hooks/useTransportes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GrupoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupoToEdit?: {
    id: string;
    nombre: string;
    transporteId: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
  };
}

// Definición local para evitar errores de tipado
interface Transporte {
  id: string;
  tipo: string;
  capacidadCBM: number;
  estado: string;
  [key: string]: any;
}

export default function GrupoModal({
  open,
  onOpenChange,
  grupoToEdit,
}: GrupoModalProps) {
  const [nombre, setNombre] = useState("");
  const [transporteId, setTransporteId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const { data: transportesData } = useTransportes();
  const createGrupoMutation = useCreateGrupo();
  const updateGrupoMutation = useUpdateGrupo();
  console.log("tranportes",transportesData);

  // transportesData es un array, no un objeto con propiedad data
  const transportesDisponibles: Transporte[] = Array.isArray(transportesData)
    ? (transportesData as Transporte[]).filter((t) => t.estado === "DISPONIBLE")
    : [];

  useEffect(() => {
    if (grupoToEdit) {
      setNombre(grupoToEdit.nombre);
      setTransporteId(grupoToEdit.transporteId);
      setFechaInicio(grupoToEdit.fechaInicio.split("T")[0]);
      setFechaFin(grupoToEdit.fechaFin.split("T")[0]);
    }
  }, [grupoToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nombre,
      transporteId,
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
    };

    try {
      if (grupoToEdit) {
        await updateGrupoMutation.mutateAsync({
          id: grupoToEdit.id,
          data,
        });
      } else {
        await createGrupoMutation.mutateAsync(data);
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setNombre("");
    setTransporteId("");
    setFechaInicio("");
    setFechaFin("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle>
            {grupoToEdit ? "Editar Grupo" : "Nuevo Grupo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Grupo</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transporte">Transporte</Label>
            <Select
              value={transporteId}
              onValueChange={(value) => setTransporteId(value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Seleccionar transporte" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {transportesDisponibles.map((transporte) => (
                  <SelectItem key={transporte.id} value={transporte.id}>
                    {transporte.tipo} - {transporte.capacidadCBM} CBM
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
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
                createGrupoMutation.isPending || updateGrupoMutation.isPending
              }
            >
              {createGrupoMutation.isPending || updateGrupoMutation.isPending
                ? "Guardando..."
                : grupoToEdit
                ? "Actualizar"
                : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
