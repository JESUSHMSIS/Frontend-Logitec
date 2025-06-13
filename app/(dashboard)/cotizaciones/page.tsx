"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  Package,
  Calculator,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NuevaCotizacionModal from "@/components/nueva-cotizacion-modal";
import {
  useProformas,
  adaptProformasToCotizaciones,
} from "@/hooks/useProformas";
import { Skeleton } from "@/components/ui/skeleton";

export type Cotizacion = {
  id: string;
  nombre: string;
  pais: string;
  transporte: string;
  fecha: string;
  cbm: number;
  precioCBM?: number;
  estadoAprobacion?: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  exWorks?: boolean;
};

export default function Cotizaciones() {
  const router = useRouter();
  const [pais, setPais] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener el ID del usuario del localStorage (solo para autenticación)
  const [usuarioId, setUsuarioId] = useState<string>("");

  useEffect(() => {
    // Obtener el ID del usuario del localStorage
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      try {
        const usuario = JSON.parse(usuarioData);
        setUsuarioId(usuario.id);
      } catch (error) {
        console.error("Error al parsear datos del usuario:", error);
      }
    }
  }, []);

  // Consultar proformas usando el hook personalizado
  const {
    data: proformas,
    isLoading,
    isError,
    error,
  } = useProformas(usuarioId);

  // Actualizar cotizaciones cuando se reciben proformas de la API
  useEffect(() => {
    if (proformas) {
      const adaptedProformas = adaptProformasToCotizaciones(proformas);
      setCotizaciones(adaptedProformas);
    }
  }, [proformas]);

  // Filtrar cotizaciones por país y término de búsqueda
  const cotizacionesFiltradas = cotizaciones
    .filter((c) => pais === "Todos" || c.pais === pais)
    .filter(
      (c) =>
        searchTerm === "" ||
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pais.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Renderizar estado de aprobación
  const renderEstadoAprobacion = (estado: string) => {
    switch (estado) {
      case "APROBADA":
        return (
          <Badge
            variant="outline"
            className="bg-green-900 bg-opacity-30 text-green-400 border-green-800 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Aprobado
          </Badge>
        );
      case "RECHAZADA":
        return (
          <Badge
            variant="outline"
            className="bg-red-900 bg-opacity-30 text-red-400 border-red-800 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Rechazado
          </Badge>
        );
      case "SOLICITADO":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-900 bg-opacity-30 text-yellow-400 border-yellow-800 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Solicitada
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-900 bg-opacity-30 text-yellow-400 border-yellow-800 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-800 p-2 rounded-md">
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">COTIZACIONES</h1>
            <p className="text-sm text-gray-400">Lista de cotizaciones</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 bg-gray-800 border-gray-700 text-white"
              placeholder="Buscar Cotización"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={pais} onValueChange={setPais}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">País</span>
                  <SelectValue placeholder="Todos" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Bolivia">Bolivia</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border border-gray-700 bg-gray-800 shadow-sm"
              >
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-3/4 bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700 mt-2" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full bg-gray-700" />
                </CardContent>
                <CardFooter className="p-4">
                  <Skeleton className="h-10 w-full bg-gray-700" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Error de carga */}
        {isError && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-400">
              Error al cargar las proformas:{" "}
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
          </div>
        )}

        {/* Cotizaciones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nueva Cotización Card */}
          <Card className="border border-gray-700 bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center h-64 p-6">
              <div className="bg-gray-700 p-4 rounded-full mb-4">
                <Calculator className="h-10 w-10 text-gray-300" />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                  onClick={() => setModalOpen(true)}
                >
                  + Nueva Cotización
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cotizaciones existentes */}
          {cotizacionesFiltradas.map((cotizacion) => (
            <Card
              key={cotizacion.id}
              className="border border-gray-700 bg-gray-800 shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900 p-2 rounded-full">
                    <Package className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-400">
                        {cotizacion.nombre}
                      </h3>
                      <span className="text-lg">
                        {cotizacion.pais === "Bolivia"
                          ? "🇧🇴"
                          : cotizacion.pais === "Chile"
                          ? "🇨🇱"
                          : "🌎"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Cotización {cotizacion.pais}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        Creado el {cotizacion.fecha}
                      </p>
                      {renderEstadoAprobacion(cotizacion.estadoAprobacion)}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-gray-800 border-gray-700 text-white"
                  >
                    <DropdownMenuItem
                      className="hover:bg-gray-700"
                      onClick={() =>
                        router.push(`/cotizacion/${cotizacion.id}`)
                      }
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-700">
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-700">
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 border border-green-800 rounded-md bg-green-900 bg-opacity-20">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold text-green-400">
                        $ {cotizacion.precioCBM || 215}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-green-900 bg-opacity-30 text-green-400 text-xs h-5 border-green-800"
                      >
                        ✓
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">1 a 5 CBM</p>
                  </div>
                  <div className="text-center p-2 border border-gray-700 rounded-md bg-gray-800">
                    <div className="font-semibold text-gray-300">
                      $ {(cotizacion.precioCBM || 215) - 10}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">5 a 10 CBM</p>
                  </div>
                  <div className="text-center p-2 border border-gray-700 rounded-md bg-gray-800">
                    <div className="font-semibold text-gray-300">
                      $ {(cotizacion.precioCBM || 215) - 20}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">10+ CBM</p>
                  </div>
                </div>

                {cotizacion.cbm > 0 || cotizacion.exWorks ? (
                  <div className="mt-4 p-2 border border-blue-900 rounded-md bg-blue-900 bg-opacity-20 flex items-center justify-center gap-2">
                    <span className="text-sm text-blue-400">
                      {cotizacion.cbm} CBM
                    </span>
                    <div className="flex">
                      <div className="bg-yellow-400 w-5 h-5 rounded-full border-2 border-gray-800 -mr-1"></div>
                      <div className="bg-yellow-400 w-5 h-5 rounded-full border-2 border-gray-800"></div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center text-sm text-gray-400">
                    Sin Proforma Ex-Works (EXW)
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-0">
                <Button
                  variant="outline"
                  className="w-full rounded-t-none bg-blue-900 bg-opacity-20 text-blue-400 border-t border-blue-900 hover:bg-blue-900 hover:bg-opacity-30"
                  onClick={() => router.push(`/cotizacion/${cotizacion.id}`)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Total {cotizacion.cbm} CBM
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de Nueva Cotización */}
      <NuevaCotizacionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={() => {}}
      />
    </div>
  );
}
