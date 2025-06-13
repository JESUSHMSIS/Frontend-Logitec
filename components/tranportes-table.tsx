"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, Package, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import NuevoTransporteModal from "./nuevo-transporte-modal";
import type { Transporte } from "@/types/api";

export default function TransportesTable() {
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransporte, setSelectedTransporte] =
    useState<Transporte | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Datos de ejemplo - en una app real vendrían de la API
  useEffect(() => {
    const transportesEjemplo: Transporte[] = [
      {
        id: "b2d53a9a-1841-4fba-9873-ba64b9290754",
        tipo: "Marítimo",
        capacidadCBM: 90,
        imagen:
          "https://res.cloudinary.com/dhoeenxwv/image/upload/v1748881149/logitec/productos/f3onoi3jffm5d72sc5zy.jpg",
        estado: "DISPONIBLE",
        activo: true,
        usuarioId: null,
        createdAt: "2025-06-02T16:20:12.522Z",
        updatedAt: "2025-06-02T16:20:12.522Z",
      },
      {
        id: "37a0dd45-a416-4584-bc2c-0fc8408c4f94",
        tipo: "Terrestre",
        capacidadCBM: 120,
        imagen:
          "https://res.cloudinary.com/dhoeenxwv/image/upload/v1749018732/logitec/productos/ndcac5bxjpl8kz4dsgez.jpg",
        estado: "NO_DISPONIBLE",
        activo: true,
        usuarioId: null,
        createdAt: "2025-06-04T06:32:12.979Z",
        updatedAt: "2025-06-04T06:32:12.979Z",
      },
      {
        id: "c3f8e9d2-5a7b-4c1d-8e9f-1a2b3c4d5e6f",
        tipo: "Aéreo",
        capacidadCBM: 25,
        imagen:
          "https://res.cloudinary.com/dhoeenxwv/image/upload/v1748881149/logitec/productos/aereo-ejemplo.jpg",
        estado: "DISPONIBLE",
        activo: true,
        usuarioId: null,
        createdAt: "2025-06-01T10:15:30.123Z",
        updatedAt: "2025-06-01T10:15:30.123Z",
      },
    ];
    setTransportes(transportesEjemplo);
  }, []);

  // Función para renderizar los cuadrados de CBM
  const renderCBMSquares = (capacidadCBM: number) => {
    const squares = [];
    const maxSquaresToShow = 50; // Máximo de cuadrados a mostrar

    for (let i = 0; i < Math.min(capacidadCBM, maxSquaresToShow); i++) {
      squares.push(
        <div
          key={i}
          className="w-4 h-4 bg-gray-200 rounded-sm m-0.5 flex items-center justify-center text-xs text-gray-500"
          title="1 CBM disponible"
        >
          0
        </div>
      );
    }

    if (capacidadCBM > maxSquaresToShow) {
      squares.push(
        <div key="more" className="text-gray-400 text-xs ml-2">
          + {capacidadCBM - maxSquaresToShow} CBM más
        </div>
      );
    }

    return squares;
  };

  const handleNuevoTransporte = (data: any) => {
    const nuevoTransporte: Transporte = {
      id: Date.now().toString(),
      tipo: data.tipo,
      capacidadCBM: data.capacidadCBM,
      imagen: data.imagen || "/placeholder.svg?height=100&width=100",
      estado: data.estado,
      activo: data.activo,
      usuarioId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransportes([...transportes, nuevoTransporte]);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "DISPONIBLE":
        return "bg-green-500";
      case "NO_DISPONIBLE":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "DISPONIBLE":
        return "Disponible";
      case "NO_DISPONIBLE":
        return "No Disponible";
      default:
        return estado;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Transportes</h2>
          <p className="text-gray-400">
            Gestiona los tipos de transporte disponibles
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Transporte
        </Button>
      </div>

      {/* Tabla de transportes */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-400" />
            Lista de Transportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Capacidad CBM</TableHead>
                <TableHead className="text-gray-400">
                  Visualización CBM
                </TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">Activo</TableHead>
                <TableHead className="text-gray-400">Fecha Creación</TableHead>
                <TableHead className="text-gray-400 text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportes.map((transporte) => (
                <TableRow key={transporte.id} className="border-gray-700">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getTipoIcon(transporte.tipo)}
                      </span>
                      <span className="text-white">{transporte.tipo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">
                        {transporte.capacidadCBM} CBM
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="border border-gray-700 rounded-md p-2 bg-gray-800 max-w-md">
                      <div className="flex flex-wrap items-center">
                        {renderCBMSquares(transporte.capacidadCBM)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getEstadoColor(
                        transporte.estado
                      )} text-white`}
                    >
                      {getEstadoText(transporte.estado)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transporte.activo ? "bg-green-500" : "bg-gray-500"
                      }
                    >
                      {transporte.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(transporte.createdAt).toLocaleDateString("es", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
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
                          onClick={() => {
                            setSelectedTransporte(transporte);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-700 text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de nuevo transporte */}
      <NuevoTransporteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleNuevoTransporte}
      />

      {/* Modal de detalles del transporte */}
      {selectedTransporte && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700">
            <DialogTitle className="text-xl font-bold text-white">
              Detalles del Transporte
            </DialogTitle>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTransporte.imagen || "/placeholder.svg"}
                  alt={selectedTransporte.tipo}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-2xl">
                      {getTipoIcon(selectedTransporte.tipo)}
                    </span>
                    {selectedTransporte.tipo}
                  </h3>
                  <p className="text-gray-400">ID: {selectedTransporte.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Capacidad CBM</label>
                  <p className="text-white font-medium">
                    {selectedTransporte.capacidadCBM} CBM
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Estado</label>
                  <p className="text-white font-medium">
                    {getEstadoText(selectedTransporte.estado)}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Activo</label>
                  <p className="text-white font-medium">
                    {selectedTransporte.activo ? "Sí" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">
                    Fecha de Creación
                  </label>
                  <p className="text-white font-medium">
                    {new Date(selectedTransporte.createdAt).toLocaleDateString(
                      "es"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Visualización CBM
                </label>
                <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
                  <div className="flex flex-wrap">
                    {renderCBMSquares(selectedTransporte.capacidadCBM)}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
