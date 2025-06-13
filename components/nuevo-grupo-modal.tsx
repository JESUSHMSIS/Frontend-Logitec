"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Package, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAllTransport } from "@/hooks/api/transportes";
import type { CreateGrupoRequest } from "@/types/api";

interface NuevoGrupoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGrupoRequest) => void;
  isLoading?: boolean;
}

export default function NuevoGrupoModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: NuevoGrupoModalProps) {
  const [nombre, setNombre] = useState("");
  const [transporteId, setTransporteId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Usar TanStack Query para obtener transportes disponibles
  const {
    data: transportes = [],
    isLoading: loadingTransportes,
    error: errorTransportes,
  } = useAllTransport();

  // Filtrar solo transportes disponibles
  const transportesDisponibles = transportes.filter((t) => t.estado === "DISPONIBLE");

  const selectedTransporte = transportesDisponibles.find((t) => t.id === transporteId);

  // Función para renderizar los cuadrados de CBM
  const renderCBMSquares = (cbmTotal: number) => {
    const squares = [];
    const maxSquaresToShow = 50;

    for (let i = 0; i < Math.min(cbmTotal, maxSquaresToShow); i++) {
      squares.push(
        <div
          key={i}
          className="w-6 h-6 bg-gray-200 rounded-sm m-0.5 flex items-center justify-center text-xs text-gray-500"
          title="CBM disponible"
        >
          0
        </div>
      );
    }

    if (cbmTotal > maxSquaresToShow) {
      squares.push(
        <div key="more" className="w-full text-center text-gray-400 mt-2">
          + {cbmTotal - maxSquaresToShow} CBM adicionales
        </div>
      );
    }

    return squares;
  };

  const handleSubmit = () => {
    if (!nombre.trim() || !transporteId || !fechaInicio || !fechaFin) return;

    onSubmit({
      nombre,
      transporteId,
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
    });

    // Reset form
    setNombre("");
    setTransporteId("");
    setFechaInicio("");
    setFechaFin("");
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      // Reset form
      setNombre("");
      setTransporteId("");
      setFechaInicio("");
      setFechaFin("");
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "marítimo":
      case "maritimo":
        return "🚢";
      case "aéreo":
      case "aereo":
        return "✈️";
      case "terrestre":
        return "🚛";
      default:
        return "📦";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <div className="sticky top-0 flex justify-between items-center pb-2">
          <DialogTitle className="text-xl font-bold text-white">
            Nuevo Grupo de Transporte
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-6 py-2">
          {/* Nombre del grupo */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">
              Nombre del Grupo
            </Label>
            <div className="relative">
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Escribe un nombre para tu grupo..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
                required
                disabled={isLoading}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Package className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Selección de transporte */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">
              Tipo de Transporte
            </Label>

            {errorTransportes && (
              <Alert className="border-red-500 bg-red-900/20 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error al cargar transportes disponibles
                </AlertDescription>
              </Alert>
            )}

            <Select
              value={transporteId}
              onValueChange={setTransporteId}
              disabled={isLoading || loadingTransportes}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue
                  placeholder={
                    loadingTransportes
                      ? "Cargando transportes..."
                      : "Selecciona un transporte disponible"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {transportesDisponibles.map((transporte) => (
                  <SelectItem key={transporte.id} value={transporte.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getTipoIcon(transporte.tipo)}
                      </span>
                      <span>
                        {transporte.tipo} - {transporte.capacidadCBM} CBM
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400 text-sm mb-2 block">
                Fecha de Inicio
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-gray-400 text-sm mb-2 block">
                Fecha de Fin
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Visualización del transporte seleccionado */}
          {selectedTransporte && (
            <div>
              <Label className="text-gray-400 text-sm mb-2 block">
                Transporte Seleccionado
              </Label>
              <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedTransporte.imagen || "/placeholder.svg"}
                    alt={selectedTransporte.tipo}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <span className="text-xl">
                        {getTipoIcon(selectedTransporte.tipo)}
                      </span>
                      {selectedTransporte.tipo}
                    </h3>
                    <p className="text-gray-400">
                      Capacidad: {selectedTransporte.capacidadCBM} CBM
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">
                    Visualización de Capacidad CBM
                  </Label>
                  <div className="border border-gray-700 rounded-md p-3 bg-gray-900">
                    <div className="flex flex-wrap">
                      {renderCBMSquares(selectedTransporte.capacidadCBM)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={
              !nombre.trim() ||
              !transporteId ||
              !fechaInicio ||
              !fechaFin ||
              isLoading
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Grupo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
