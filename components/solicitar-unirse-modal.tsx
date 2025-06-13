"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useProformasAprobadas, useSendProformasAprobada } from "@/hooks/api/proformas";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Transporte {
  id: string;
  tipo: string;
  capacidadCBM: number;
  imagen: string;
  estado: string;
  activo: boolean;
  usuarioId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GrupoDetalle {
  id: string;
  nombre: string;
  transporteId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  cbmDisponible: number;
  createdAt: string;
  updatedAt: string;
  transporte: Transporte;
  proformas: any[];
  solicitudes: any[];
}

interface Proforma {
  id: string;
  nombre: string;
  cbmTotal: number;
  estadoAprobacion: string;
  createdAt: string;
  usuarioId: string;
  usuario?: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  destino?: {
    pais: string;
  };
}

interface SolicitarUnirseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo: GrupoDetalle;
  onSubmit: (cotizacionId: string) => void;
}

// Función segura para formatear fechas
function safeFormatDate(
  dateString: string | null | undefined,
  fallback = "Fecha inválida"
) {
  const date = dateString ? new Date(dateString) : null;
  return date && !isNaN(date.getTime())
    ? format(date, "dd/MMM/yyyy", { locale: es })
    : fallback;
}

export default function SolicitarUnirseModal({
  open,
  onOpenChange,
  grupo,
  onSubmit,
}: SolicitarUnirseModalProps) {
  const [selectedCotizacion, setSelectedCotizacion] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { data: proformasAprobadas, isLoading } = useProformasAprobadas();
  const sendProformaAprobada = useSendProformasAprobada(grupo.id);

  const handleSubmit = async () => {
    if (!selectedCotizacion) {
      setError("Por favor selecciona una proforma");
      return;
    }
    
    try {
      await sendProformaAprobada.mutateAsync(selectedCotizacion);
      toast.success("Solicitud enviada con éxito");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al enviar la solicitud");
      console.error("Error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Solicitar Unirse al Grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Grupo</Label>
            <div className="p-3 rounded-md bg-gray-700 flex items-center gap-3">
              <div className="text-white font-medium">{grupo.nombre}</div>
              <div className="text-gray-400 text-sm ml-auto">
                {safeFormatDate(grupo.fechaInicio)} -{" "}
                {safeFormatDate(grupo.fechaFin)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Selecciona una proforma</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : proformasAprobadas && proformasAprobadas.length > 0 ? (
              <RadioGroup
                value={selectedCotizacion}
                onValueChange={setSelectedCotizacion}
                className="space-y-2"
              >
                {proformasAprobadas?.map((proforma: Proforma) => (
                  <div
                    key={proforma.id}
                    className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-700"
                  >
                    <RadioGroupItem
                      value={proforma.id}
                      id={proforma.id}
                      className="text-blue-400"
                    />
                    <Label
                      htmlFor={proforma.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-white">
                        {proforma.nombre}
                      </div>
                      <div className="text-sm text-gray-400 flex justify-between">
                        <span>CBM: {proforma.cbmTotal.toFixed(1)}</span>
                        <span>Destino: {proforma.destino?.pais || 'No especificado'}</span>
                        <span>{safeFormatDate(proforma.createdAt)}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No tienes proformas aprobadas disponibles para unirte a este
                grupo
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Capacidad disponible</Label>
            <div className="p-3 rounded-md bg-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">CBM Disponible:</span>
                <span className="text-white font-medium">
                  {grupo.cbmDisponible} CBM
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={!selectedCotizacion || !proformasAprobadas || proformasAprobadas.length === 0}
          >
            Solicitar Unirse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
