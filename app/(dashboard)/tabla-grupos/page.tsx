"use client";

import React, { useState } from "react";
import { useGruposTable } from "@/hooks/useGrupos";
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
  ArrowLeft,
  ArrowRight,
} from "lucide-react"; // Añadir ArrowLeft y ArrowRight
import GrupoModal from "@/components/grupo-modal";
import { useDeleteGrupo } from "@/hooks/useGrupos";

export default function GruposPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGruposTable({
    page,
    limit,
    search: searchTerm,
  });

  const deleteGrupoMutation = useDeleteGrupo();

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (grupo: any) => {
    setSelectedGrupo(grupo);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este grupo?")) {
      try {
        await deleteGrupoMutation.mutateAsync(id);
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
    return <div>Error al cargar los grupos</div>;
  }

  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Grupos</h1>
          <Button
            onClick={() => {
              setSelectedGrupo(null);
              setModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/30">
                <TableHead className="text-gray-400"></TableHead>
                <TableHead className="text-gray-400">Nombre</TableHead>
                <TableHead className="text-gray-400">Transporte</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">CBM Disponible</TableHead>
                <TableHead className="text-gray-400">Fecha Inicio</TableHead>
                <TableHead className="text-gray-400">Fecha Fin</TableHead>
                <TableHead className="text-gray-400 text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((grupo) => (
                <React.Fragment key={grupo.id}>
                  <TableRow className="border-gray-700 hover:bg-gray-800/30 transition-colors duration-200">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(grupo.id)}
                      >
                        {expandedRows[grupo.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{grupo.nombre}</TableCell>
                    <TableCell>{grupo.transporte.tipo}</TableCell>
                    <TableCell>{renderEstado(grupo.estado)}</TableCell>
                    <TableCell>{grupo.cbmDisponible} CBM</TableCell>
                    <TableCell>{formatDate(grupo.fechaInicio)}</TableCell>
                    <TableCell>{formatDate(grupo.fechaFin)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-800"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-gray-800 text-white border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEdit(grupo)}
                            className="hover:bg-gray-700 cursor-pointer"
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(grupo.id)}
                            className="hover:bg-gray-700 cursor-pointer text-red-400"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows[grupo.id] && (
                    <TableRow className="border-gray-700 bg-gray-800/20">
                      <TableCell colSpan={8} className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">ID</p>
                            <p>{grupo.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Transporte</p>
                            <div className="mt-2">
                              <img
                                src={grupo.transporte.imagen}
                                alt="Transporte"
                                className="max-w-[200px] rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Creado</p>
                            <p>{formatDate(grupo.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Actualizado</p>
                            <p>{formatDate(grupo.updatedAt)}</p>
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <span className="text-sm text-gray-400">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <GrupoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          grupoToEdit={selectedGrupo}
        />
      </div>
    </div>
  );
}
