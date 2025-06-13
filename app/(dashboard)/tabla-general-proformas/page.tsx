"use client";
import React, { useState } from "react";
import { useAllProformas } from "@/hooks/useAllProformas";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AcceptButton, RejectButton } from "@/components/actions-button";
import ProformaDocumentsModal from "@/components/ProformaDocumentsModal";
import { CreateDocumentModal } from "@/components/CreateDocumentModal";
import CompletarRequisitosModal from "@/components/CompletarRequisitosModal";

export default function TablaGeneralProformas() {
  const router = useRouter();
  const [pais, setPais] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const { data: proformas, isLoading, isError, error } = useAllProformas();
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const proformasFiltradas = proformas
    ? proformas
        .filter((p) => pais === "Todos" || p.destino.pais === pais)
        .filter(
          (p) =>
            searchTerm === "" ||
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.destino.pais.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  // const renderDocumentButton = (proforma: any) => {
  //   if (proforma.estadoAprobacion === "APROBADA") {
  //     return (
  //       <Button
  //         variant="outline"
  //         size="sm"
  //         onClick={() => handleOpenCreateDocument(proforma.id)}
  //         className="bg-blue-900 bg-opacity-30 text-blue-400 border-blue-800 hover:bg-blue-800 hover:text-blue-300"
  //       >
  //         Crear Documento
  //       </Button>
  //     );
  //   }
  //   return null;
  // };

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
      case "SOLICITADA":
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

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [selectedProformaId, setSelectedProformaId] = useState<string | null>(
    null
  );
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] =
    useState(false);

  const handleOpenCreateDocument = (proformaId: string) => {
    setSelectedProformaId(proformaId);
    setIsCreateDocumentModalOpen(true);
  };

  // Añadir estos estados
  const [isCompletarRequisitosModalOpen, setIsCompletarRequisitosModalOpen] =
    useState(false);

  const handleOpenCompletarRequisitos = (proformaId: string) => {
    setSelectedProformaId(proformaId);
    setIsCompletarRequisitosModalOpen(true);
  };

  // Modificar el renderDocumentButton para incluir el nuevo botón
  const renderDocumentButton = (proforma: any) => {
    if (proforma.estadoAprobacion === "APROBADA") {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCreateDocument(proforma.id)}
            className="bg-blue-900 bg-opacity-30 text-blue-400 border-blue-800 hover:bg-blue-800 hover:text-blue-300"
          >
            Crear Documento
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCompletarRequisitos(proforma.id)}
            className="bg-yellow-900 bg-opacity-30 text-yellow-400 border-yellow-800 hover:bg-yellow-800 hover:text-yellow-300"
          >
            Completar Requisitos
          </Button>
        </div>
      );
    }
    return null;
  };

  // Añadir el modal al final del componente, junto a los otros modales
  <CompletarRequisitosModal
    proformaId={selectedProformaId || ""}
    open={isCompletarRequisitosModalOpen}
    onClose={() => setIsCompletarRequisitosModalOpen(false)}
  />;

  // Modificar el DropdownMenuContent dentro del map de proformas
  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-800 p-2 rounded-md">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TABLA DE PROFORMAS</h1>
            <p className="text-sm text-gray-400">
              Visualización detallada de proformas
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 bg-gray-800 border-gray-700 text-white"
              placeholder="Buscar Proforma"
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
          <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden mb-6">
            <div className="p-4">
              <Skeleton className="h-8 w-full bg-gray-700 mb-4" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-gray-700" />
                ))}
              </div>
            </div>
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

        {/* Tabla de Proformas */}
        {!isLoading && !isError && proformasFiltradas.length > 0 && (
          <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-400">Expandir</TableHead>
                  <TableHead className="text-gray-400">Nombre</TableHead>
                  <TableHead className="text-gray-400">País</TableHead>
                  <TableHead className="text-gray-400">Transporte</TableHead>
                  <TableHead className="text-gray-400">Fecha</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-gray-400">CBM</TableHead>
                  <TableHead className="text-gray-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proformasFiltradas.map((proforma) => (
                  <React.Fragment key={proforma.id}>
                    <TableRow className="border-gray-700 hover:bg-gray-700">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRowExpansion(proforma.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          {expandedRows[proforma.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {proforma.nombre}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {proforma.destino.pais === "Bolivia"
                              ? "🇧🇴"
                              : proforma.destino.pais === "Chile"
                              ? "🇨🇱"
                              : "🌎"}
                          </span>
                          {proforma.destino.pais}
                        </div>
                      </TableCell>
                      <TableCell>{proforma.transporte?.tipo}</TableCell>
                      <TableCell>{formatDate(proforma.createdAt)}</TableCell>
                      <TableCell>
                        {renderEstadoAprobacion(proforma.estadoAprobacion)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-900 bg-opacity-30 text-blue-400 border-blue-800"
                        >
                          {proforma.cbmTotal} CBM
                        </Badge>
                      </TableCell>
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
                              onClick={() =>
                                router.push(`/cotizacion/${proforma.id}`)
                              }
                            >
                              Ver Detalles
                            </DropdownMenuItem>
                            {proforma.estadoAprobacion === "APROBADO" && (
                              <DropdownMenuItem
                                className="hover:bg-gray-700"
                                onClick={() =>
                                  handleOpenCreateDocument(proforma.id)
                                }
                              >
                                Crear Documento
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="hover:bg-gray-700">
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>

                          {selectedProformaId && (
                            <>
                              <CreateDocumentModal
                                proformaId={selectedProformaId}
                                open={isCreateDocumentModalOpen}
                                onClose={() => {
                                  setIsCreateDocumentModalOpen(false);
                                  setSelectedProformaId(null);
                                }}
                              />
                              <CompletarRequisitosModal
                                proformaId={selectedProformaId}
                                open={isCompletarRequisitosModalOpen}
                                onClose={() => {
                                  setIsCompletarRequisitosModalOpen(false);
                                  setSelectedProformaId(null);
                                }}
                              />
                            </>
                          )}
                          {
                            <CompletarRequisitosModal
                              proformaId={selectedProformaId}
                              open={isCompletarRequisitosModalOpen}
                              onClose={() =>
                                setIsCompletarRequisitosModalOpen(false)
                              }
                            />
                          }
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows[proforma.id] && (
                      <TableRow className="border-gray-700 bg-gray-900">
                        <TableCell colSpan={8} className="p-0">
                          <div className="p-4 bg-gray-900 border-t border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-blue-400">
                                  Información General
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-sm text-gray-400">ID:</p>
                                    <p className="text-sm">{proforma.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400">
                                      Usuario:
                                    </p>
                                    <p className="text-sm">
                                      {proforma.usuario?.nombre}{" "}
                                      {proforma.usuario?.apellido}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400">
                                      Precio CBM:
                                    </p>
                                    <p className="text-sm">
                                      ${proforma.precioCBM}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400">
                                      CBM Total:
                                    </p>
                                    <p className="text-sm">
                                      {proforma.cbmTotal} CBM
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 ">
                                <h3 className="text-lg font-semibold text-blue-400">
                                  Estado de Aprobación
                                </h3>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Estado:
                                  </p>
                                  <div className="mt-1 w-auto">
                                    {renderEstadoAprobacion(
                                      proforma.estadoAprobacion
                                    )}
                                  </div>
                                </div>
                                {proforma.comentarioAprobacion && (
                                  <div>
                                    <p className="text-sm text-gray-400">
                                      Comentario:
                                    </p>
                                    <p className="text-sm">
                                      {proforma.comentarioAprobacion}
                                    </p>
                                  </div>
                                )}
                                {proforma.estadoAprobacion === "SOLICITADA" ? (
                                  <>
                                    <AcceptButton proformaId={proforma.id} />
                                    <RejectButton proformaId={proforma.id} />
                                  </>
                                ) : (
                                  <></>
                                )}
                                {renderDocumentButton(proforma)}
                              </div>
                            </div>

                            {/* Información de Ex-Works */}
                            {proforma.exWorks &&
                              proforma.exWorks.length > 0 && (
                                <div className="mt-4">
                                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                    Información Ex-Works
                                  </h3>
                                  {proforma.exWorks.map((exWork) => (
                                    <div
                                      key={exWork.id}
                                      className="border border-gray-700 rounded-md p-3 bg-gray-800"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Enlace de Compra:
                                          </p>
                                          <p className="text-sm">
                                            {exWork.enlaceCompra ||
                                              "No especificado"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Control de Calidad:
                                          </p>
                                          <p className="text-sm">
                                            {exWork.controlCalidad
                                              ? "Sí"
                                              : "No"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Fecha de Creación:
                                          </p>
                                          <p className="text-sm">
                                            {formatDate(exWork.createdAt)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Costo Envío Almacén:
                                          </p>
                                          <p className="text-sm">
                                            ${exWork.costoEnvioAlmacen}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Gastos Despacho:
                                          </p>
                                          <p className="text-sm">
                                            ${exWork.gastosDespacho}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Gastos Desconsolidación:
                                          </p>
                                          <p className="text-sm">
                                            ${exWork.gastosDesconsolidacion}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-400">
                                            Otros Gastos:
                                          </p>
                                          <p className="text-sm">
                                            ${exWork.otrosGastos}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Productos */}
                                      {exWork.productos &&
                                        exWork.productos.length > 0 && (
                                          <div className="mt-3">
                                            <p className="text-sm font-medium text-gray-300 mb-2">
                                              Productos (
                                              {exWork.productos.length}):
                                            </p>
                                            <div className="max-h-40 overflow-y-auto">
                                              <Table>
                                                <TableHeader>
                                                  <TableRow className="border-gray-700">
                                                    <TableHead className="text-gray-400 text-xs">
                                                      Descripción
                                                    </TableHead>
                                                    <TableHead className="text-gray-400 text-xs">
                                                      HS Code
                                                    </TableHead>
                                                    <TableHead className="text-gray-400 text-xs">
                                                      Cantidad
                                                    </TableHead>
                                                    <TableHead className="text-gray-400 text-xs">
                                                      Precio Unit.
                                                    </TableHead>
                                                    <TableHead className="text-gray-400 text-xs">
                                                      Total
                                                    </TableHead>
                                                    <TableHead className="text-gray-400 text-xs">
                                                      CBM
                                                    </TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {exWork.productos.map(
                                                    (producto) => (
                                                      <TableRow
                                                        key={producto.id}
                                                        className="border-gray-700"
                                                      >
                                                        <TableCell className="text-xs">
                                                          {producto.descripcion}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                          {producto.hsCode}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                          {producto.cantidad}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                          $
                                                          {
                                                            producto.precioUnitario
                                                          }
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                          ${producto.total}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                          {producto.totalCbm}{" "}
                                                          CBM
                                                        </TableCell>
                                                      </TableRow>
                                                    )
                                                  )}
                                                </TableBody>
                                              </Table>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && !isError && proformasFiltradas.length === 0 && (
          <div className="bg-gray-800 rounded-md border border-gray-700 p-8 text-center">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No se encontraron proformas
            </h3>
            <p className="text-gray-500 mb-4">
              No hay proformas que coincidan con los criterios de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
