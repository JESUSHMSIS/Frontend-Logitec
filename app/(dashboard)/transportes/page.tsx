"use client";

import React, { useState } from "react";
import { useTransportes, useTransportesTable } from "@/hooks/useTransportes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import TransporteModal from "@/components/transporte-modal";
import { useDeleteTransporte } from "@/hooks/useTransportes";

export default function TransportesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransporte, setSelectedTransporte] = useState<any>(null);

  const { data: transportes, isLoading, isError } = useTransportes();

  const deleteTransporteMutation = useDeleteTransporte();

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (transporte: any) => {
    setSelectedTransporte(transporte);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este transporte?")
    ) {
      try {
        await deleteTransporteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const renderEstado = (estado: string) => {
    switch (estado) {
      case "DISPONIBLE":
        return (
          <Badge
            variant="outline"
            className="bg-green-900 bg-opacity-30 text-green-400 border-green-800 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Disponible
          </Badge>
        );
      case "NO_DISPONIBLE":
        return (
          <Badge
            variant="outline"
            className="bg-red-900 bg-opacity-30 text-red-400 border-red-800 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            No Disponible
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48 bg-gray-800" />
            <Skeleton className="h-10 w-40 bg-gray-800" />
          </div>

          <div className="mb-4">
            <Skeleton className="h-10 w-full bg-gray-800" />
          </div>

          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">
                    <Skeleton className="h-4 w-20 bg-gray-800" />
                  </TableHead>
                  <TableHead className="text-gray-400">
                    <Skeleton className="h-4 w-24 bg-gray-800" />
                  </TableHead>
                  <TableHead className="text-gray-400">
                    <Skeleton className="h-4 w-20 bg-gray-800" />
                  </TableHead>
                  <TableHead className="text-gray-400">
                    <Skeleton className="h-4 w-32 bg-gray-800" />
                  </TableHead>
                  <TableHead className="text-gray-400 text-right">
                    <Skeleton className="h-4 w-16 bg-gray-800 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index} className="border-gray-700">
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-28 bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36 bg-gray-800" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 bg-gray-800 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error al cargar los transportes</div>;
  }

  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-800 p-2 rounded-md">
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              TABLA DE TRANSPORTES
            </h1>
            <p className="text-sm text-gray-400">
              Visualización detallada de transportes
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 bg-gray-800 border-gray-700 text-white"
            placeholder="Buscar Transporte"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setSelectedTransporte(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 mb-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Transporte
        </Button>
        {/* Table */}
        <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-400">Expandir</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Capacidad CBM</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">
                  Última Actualización
                </TableHead>
                <TableHead className="text-gray-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportes?.map((transporte) => (
                <React.Fragment key={transporte.id}>
                  <TableRow className="border-gray-700 hover:bg-gray-700">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(transporte.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        {expandedRows[transporte.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {transporte.tipo}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-900 bg-opacity-30 text-blue-400 border-blue-800"
                      >
                        {transporte.capacidadCBM} CBM
                      </Badge>
                    </TableCell>
                    <TableCell>{renderEstado(transporte.estado)}</TableCell>
                    <TableCell>{formatDate(transporte.updatedAt)}</TableCell>
                    <TableCell>
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
                            onClick={() => handleEdit(transporte)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-700 text-red-400"
                            onClick={() => handleDelete(transporte.id)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows[transporte.id] && (
                    <TableRow className="border-gray-700 bg-gray-900">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-4 bg-gray-900 border-t border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-blue-400">
                                Información General
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-400">ID:</p>
                                  <p className="text-sm">{transporte.id}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Tipo:</p>
                                  <p className="text-sm">{transporte.tipo}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Capacidad:
                                  </p>
                                  <p className="text-sm">
                                    {transporte.capacidadCBM} CBM
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Estado:
                                  </p>
                                  <div className="mt-1">
                                    {renderEstado(transporte.estado)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-blue-400">
                                Detalles Adicionales
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Usuario Asignado:
                                  </p>
                                  <p className="text-sm">
                                    {transporte.usuario
                                      ? `${transporte.usuario.nombre} ${transporte.usuario.apellido}`
                                      : "No asignado"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Imagen:
                                  </p>
                                  {transporte.imagen ? (
                                    <img
                                      src={transporte.imagen}
                                      alt="Transporte"
                                      className="w-20 h-20 object-cover rounded-md"
                                    />
                                  ) : (
                                    <p className="text-sm">No disponible</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Creado:
                                  </p>
                                  <p className="text-sm">
                                    {formatDate(transporte.createdAt)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Actualizado:
                                  </p>
                                  <p className="text-sm">
                                    {formatDate(transporte.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TransporteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        transporte={selectedTransporte}
      />
    </div>
  );
}
