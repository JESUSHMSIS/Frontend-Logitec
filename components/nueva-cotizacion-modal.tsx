"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Ship, Plane, Truck, X, Loader2 } from "lucide-react";
import { useTransportes } from "@/hooks/useTransportes";
import { useDestinos } from "@/hooks/useDestinos";
import { useCreateProforma } from "@/hooks/useProformas";
import { toast } from "sonner";

interface NuevaCotizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    nombre: string;
    transporteId: string;
    destinoId: string;
    transporte: "Maritimo" | "Aereo" | "Terrestre";
    pais: string;
  }) => void;
}

export default function NuevaCotizacionModal({
  open,
  onOpenChange,
  onSubmit,
}: NuevaCotizacionModalProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [transporte, setTransporte] = useState<
    "Maritimo" | "Aereo" | "Terrestre"
  >("Terrestre");
  const [transporteId, setTransporteId] = useState<string>("");
  const [destinoId, setDestinoId] = useState<string>("");
  const [pais, setPais] = useState<string>("");

  const createProforma = useCreateProforma({
    onSuccess: (data) => {
      toast.success("Cotización creada con éxito");
      router.push(`/cotizacion/${data.id}`);
    },
  });

  const {
    data: transportes,
    isLoading: isLoadingTransportes,
    error: transportesError,
  } = useTransportes();

  const {
    data: destinos,
    isLoading: isLoadingDestinos,
    error: destinosError,
  } = useDestinos();

  const handleTransporteChange = (
    value: "Maritimo" | "Aereo" | "Terrestre"
  ) => {
    setTransporte(value);

    if (transportes?.length > 0) {
      const transporteSeleccionado = transportes.find(
        (t) => t.tipo.toLowerCase() === value
      );
      if (transporteSeleccionado) {
        setTransporteId(transporteSeleccionado.id);
      }
    }
  };

  const handleDestinoChange = (destinoId: string, paisNombre: string) => {
    setDestinoId(destinoId);
    setPais(paisNombre);
  };

  const handleSubmit = () => {
    if (!nombre.trim() || !transporteId || !destinoId) return;

    const usuarioData = localStorage.getItem("usuario");

    if (usuarioData) {
      const usuario = JSON.parse(usuarioData);
      const userId = usuario.id;

      createProforma.mutate({
        nombre,
        transporteId,
        destinoId,
        usuarioId: userId,
      });

      onOpenChange(false);
      // No es necesario hacer la redirección aquí, se hará en el callback onSuccess
    } else {
      console.error("Usuario no encontrado en localStorage");
    }
  };

  const isLoading = isLoadingTransportes || isLoadingDestinos;
  const hasError = transportesError || destinosError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <div className="sticky top-0 flex justify-between items-center pb-2">
          <DialogTitle className=" text-xl font-bold text-white">
            Nueva Cotización
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white bg-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {hasError && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-md p-3 text-red-400 mb-4">
            Error al cargar datos. Por favor, intente nuevamente.
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid gap-6 py-2">
            {/* Mapa y barco */}
            <div className="relative h-40 bg-gray-800 rounded-md overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <img
                  src="/placeholder.svg?height=200&width=600"
                  alt="Mapa de Sudamérica"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-32">
                <img
                  src="/placeholder.svg?height=160&width=256"
                  alt="Barco de carga"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Precios CBM */}
            <div>
              <h3 className="text-center text-gray-400 mb-3">Precios CBM</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border border-green-800 rounded-md bg-green-900 bg-opacity-20">
                  <div className="font-semibold text-green-400">$ 215</div>
                  <p className="text-xs text-gray-400 mt-1">1 a 5 CBM</p>
                </div>
                <div className="text-center p-3 border border-gray-700 rounded-md bg-gray-800">
                  <div className="font-semibold text-gray-300">$ 205</div>
                  <p className="text-xs text-gray-400 mt-1">5 a 10 CBM</p>
                </div>
                <div className="text-center p-3 border border-gray-700 rounded-md bg-gray-800">
                  <div className="font-semibold text-gray-300">$ 195</div>
                  <p className="text-xs text-gray-400 mt-1">10+ CBM</p>
                </div>
              </div>
            </div>

            {/* Medio de transporte */}
            <div>
              <h3 className="text-center text-gray-400 mb-3">
                Elige el medio de transporte
              </h3>
              <RadioGroup
                value={transporte}
                onValueChange={handleTransporteChange}
                className="grid grid-cols-3 gap-4"
              >
                {Array.isArray(transportes) && transportes.length > 0 &&
                  Array.from(
                    new Map(transportes.map(t => [t.tipo.toLowerCase(), t])).values()
                  ).map((transporte) => (
                    <div
                      key={transporte.id}
                      className={`border rounded-md p-4 ${
                        transporteId === transporte.id
                          ? "border-blue-800 bg-blue-900 bg-opacity-20"
                          : "border-gray-700 bg-gray-800"
                      }`}
                      onClick={() => {
                        setTransporte(transporte.tipo.toLowerCase() as "Maritimo" | "Aereo" | "Terrestre");
                        setTransporteId(transporte.id);
                      }}
                    >
                      <RadioGroupItem
                        value={transporte.tipo.toLowerCase()}
                        id={transporte.tipo.toLowerCase()}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={transporte.tipo.toLowerCase()}
                        className="flex items-center justify-center gap-2 cursor-pointer w-full"
                      >
                        {transporte.tipo.toLowerCase() === "Maritimo" && (
                          <Ship className="h-5 w-5 text-blue-400" />
                        )}
                        {transporte.tipo.toLowerCase() === "Mereo" && (
                          <Plane className="h-5 w-5 text-blue-400" />
                        )}
                        {transporte.tipo.toLowerCase() === "Terestre" && (
                          <Truck className="h-5 w-5 text-blue-400" />
                        )}
                        <span
                          className={
                            transporteId === transporte.id
                              ? "text-blue-400"
                              : "text-gray-300"
                          }
                        >
                          {transporte.tipo}
                        </span>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>

            {/* Nombre de cotización */}
            <div>
              <h3 className="text-center text-gray-400 mb-3">
                Dale un nombre a tu cotización
              </h3>
              <div className="relative">
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Escribe un nombre para tu cotización..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="12"
                      height="12"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4.5 5.5H11.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.5 8.5H11.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.5 11.5H8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* País de destino */}
            <div>
              <h3 className="text-center text-gray-400 mb-3">
                ¿Dónde te gustaría que llegue tu pedido?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {destinos &&
                  destinos.map((destino) => (
                    <div
                      key={destino.id}
                      className={`border rounded-md p-4 cursor-pointer ${
                        destinoId === destino.id
                          ? "border-blue-800 bg-blue-900 bg-opacity-20"
                          : "border-gray-700 bg-gray-800"
                      }`}
                      onClick={() =>
                        handleDestinoChange(destino.id, destino.pais)
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">
                          {destino.pais === "Bolivia"
                            ? "🇧🇴"
                            : destino.pais === "Chile"
                            ? "🇨🇱"
                            : "🌎"}
                        </span>
                        <span
                          className={
                            destinoId === destino.id
                              ? "text-blue-400"
                              : "text-gray-300"
                          }
                        >
                          {destino.pais}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

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
            disabled={
              isLoading || !nombre.trim() || !destinoId || !transporteId
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              "Crear Cotización"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
