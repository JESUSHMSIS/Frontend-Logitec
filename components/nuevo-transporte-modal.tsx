"use client";

import type React from "react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload, Package } from "lucide-react";

interface NuevoTransporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    tipo: string;
    capacidadCBM: number;
    estado: "DISPONIBLE" | "NO_DISPONIBLE";
    activo: boolean;
    imagen?: string;
  }) => void;
}

export default function NuevoTransporteModal({
  open,
  onOpenChange,
  onSubmit,
}: NuevoTransporteModalProps) {
  const [tipo, setTipo] = useState("");
  const [capacidadCBM, setCapacidadCBM] = useState("20");
  const [estado, setEstado] = useState<"DISPONIBLE" | "NO_DISPONIBLE">(
    "DISPONIBLE"
  );
  const [activo, setActivo] = useState(true);
  const [imagen, setImagen] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagen(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!tipo.trim() || !capacidadCBM) return;

    onSubmit({
      tipo,
      capacidadCBM: Number(capacidadCBM),
      estado,
      activo,
      imagen: imagen || undefined,
    });

    // Reset form
    setTipo("");
    setCapacidadCBM("20");
    setEstado("DISPONIBLE");
    setActivo(true);
    setImagen(null);
    onOpenChange(false);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <div className="sticky top-0 flex justify-between items-center pb-2">
          <DialogTitle className="text-xl font-bold text-white">
            Nuevo Transporte
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-6 py-2">
          {/* Imagen del transporte */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">
              Imagen del Transporte
            </Label>
            <div
              className="border border-gray-700 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() =>
                document.getElementById("transporte-image")?.click()
              }
            >
              {imagen ? (
                <img
                  src={imagen || "/placeholder.svg"}
                  alt="Transporte preview"
                  className="max-h-32 object-contain"
                />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-gray-500">
                    Subir imagen del transporte
                  </span>
                </>
              )}
              <input
                type="file"
                id="transporte-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Tipo de transporte */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">
              Tipo de Transporte
            </Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecciona el tipo de transporte" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="Marítimo">🚢 Marítimo</SelectItem>
                <SelectItem value="Aéreo">✈️ Aéreo</SelectItem>
                <SelectItem value="Terrestre">🚛 Terrestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Capacidad en CBM */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">
              Capacidad en metros cúbicos (CBM)
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                step="1"
                value={capacidadCBM}
                onChange={(e) => setCapacidadCBM(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Package className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Visualización de CBM */}
          {Number(capacidadCBM) > 0 && (
            <div>
              <Label className="text-gray-400 text-sm mb-2 block">
                Visualización de capacidad
              </Label>
              <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
                <div className="flex flex-wrap">
                  {renderCBMSquares(Number(capacidadCBM))}
                </div>
              </div>
            </div>
          )}

          {/* Estado */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">Estado</Label>
            <RadioGroup
              value={estado}
              onValueChange={(value) =>
                setEstado(value as "DISPONIBLE" | "NO_DISPONIBLE")
              }
              className="grid grid-cols-2 gap-4"
            >
              <div
                className={`border rounded-md p-4 ${
                  estado === "DISPONIBLE"
                    ? "border-green-800 bg-green-900 bg-opacity-20"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                <RadioGroupItem
                  value="DISPONIBLE"
                  id="disponible"
                  className="sr-only"
                />
                <Label
                  htmlFor="disponible"
                  className="flex items-center justify-center cursor-pointer w-full"
                >
                  <span
                    className={
                      estado === "DISPONIBLE"
                        ? "text-green-400"
                        : "text-gray-300"
                    }
                  >
                    Disponible
                  </span>
                </Label>
              </div>
              <div
                className={`border rounded-md p-4 ${
                  estado === "NO_DISPONIBLE"
                    ? "border-red-800 bg-red-900 bg-opacity-20"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                <RadioGroupItem
                  value="NO_DISPONIBLE"
                  id="no-disponible"
                  className="sr-only"
                />
                <Label
                  htmlFor="no-disponible"
                  className="flex items-center justify-center cursor-pointer w-full"
                >
                  <span
                    className={
                      estado === "NO_DISPONIBLE"
                        ? "text-red-400"
                        : "text-gray-300"
                    }
                  >
                    No Disponible
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Activo */}
          <div>
            <Label className="text-gray-400 text-sm mb-2 block">
              ¿Transporte activo?
            </Label>
            <RadioGroup
              value={activo.toString()}
              onValueChange={(value) => setActivo(value === "true")}
              className="grid grid-cols-2 gap-4"
            >
              <div
                className={`border rounded-md p-4 ${
                  activo
                    ? "border-blue-800 bg-blue-900 bg-opacity-20"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                <RadioGroupItem
                  value="true"
                  id="activo-si"
                  className="sr-only"
                />
                <Label
                  htmlFor="activo-si"
                  className="flex items-center justify-center cursor-pointer w-full"
                >
                  <span className={activo ? "text-blue-400" : "text-gray-300"}>
                    Sí
                  </span>
                </Label>
              </div>
              <div
                className={`border rounded-md p-4 ${
                  !activo
                    ? "border-blue-800 bg-blue-900 bg-opacity-20"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                <RadioGroupItem
                  value="false"
                  id="activo-no"
                  className="sr-only"
                />
                <Label
                  htmlFor="activo-no"
                  className="flex items-center justify-center cursor-pointer w-full"
                >
                  <span className={!activo ? "text-blue-400" : "text-gray-300"}>
                    No
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!tipo.trim()}
          >
            Crear Transporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
