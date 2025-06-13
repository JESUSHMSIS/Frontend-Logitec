"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Ship,
  Plane,
  Package,
  Calendar,
  ArrowLeft,
  MoreVertical,
  FileText,
  UserPlus,
  Share2,
  Printer,
  Info,
  Truck,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import SolicitarUnirseModal from "@/components/solicitar-unirse-modal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useGrupo,
  useSolicitarUnirse,
  useGestionarSolicitud,
} from "@/hooks/api/grupos";

// Función segura para formatear fechas
const safeFormatDate = (
  dateString: string | null | undefined,
  fallback = "Fecha inválida"
): string => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  return !isNaN(date.getTime())
    ? format(date, "dd/MMM/yyyy", { locale: es })
    : fallback;
};

export default function DetalleGrupo() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id as string;

  const [modalUnirseOpen, setModalUnirseOpen] = useState(false);

  // TanStack Query hooks
  const { data: grupo, isLoading, error, refetch } = useGrupo(id);

  const solicitarUnirseMutation = useSolicitarUnirse();
  const gestionarSolicitudMutation = useGestionarSolicitud();

  // Función para renderizar los cuadrados de CBM
  const renderCBMSquares = (capacidadTotal: number, cbmDisponible: number) => {
    const squares = [];
    const cbmOcupado = capacidadTotal - cbmDisponible;

    const fullSquares = Math.floor(cbmOcupado);
    const partialSquare = cbmOcupado - fullSquares > 0;
    const emptySquares =
      Math.floor(capacidadTotal) - fullSquares - (partialSquare ? 1 : 0);

    // Cuadrados completos (ocupados)
    for (let i = 0; i < fullSquares; i++) {
      squares.push(
        <div
          key={`full-${i}`}
          className="w-8 h-8 bg-blue-500 rounded-sm m-0.5 flex items-center justify-center text-xs text-white font-medium"
          title="1 CBM ocupado"
        >
          1
        </div>
      );
    }

    // Cuadrado parcial si existe
    if (partialSquare) {
      const partialValue = cbmOcupado - fullSquares;
      squares.push(
        <div
          key="partial"
          className="w-8 h-8 bg-blue-300 rounded-sm m-0.5 flex items-center justify-center text-xs text-blue-900 font-medium"
          title={`${partialValue.toFixed(2)} CBM ocupado`}
        >
          {partialValue.toFixed(1)}
        </div>
      );
    }

    // Cuadrados vacíos (disponibles)
    for (let i = 0; i < emptySquares; i++) {
      squares.push(
        <div
          key={`empty-${i}`}
          className="w-8 h-8 bg-gray-200 rounded-sm m-0.5 flex items-center justify-center text-xs text-gray-500"
          title="CBM disponible"
        >
          0
        </div>
      );
    }

    return squares;
  };

  // Función para obtener el color de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "DISPONIBLE":
        return "bg-green-500";
      case "EN_CURSO":
        return "bg-blue-500";
      case "COMPLETADO":
        return "bg-purple-500";
      case "CANCELADO":
        return "bg-red-500";
      case "APROBADA":
        return "bg-green-500";
      case "PENDIENTE":
        return "bg-yellow-500";
      case "RECHAZADA":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Función para obtener el texto de estado
  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "DISPONIBLE":
        return "Disponible";
      case "EN_CURSO":
        return "En Curso";
      case "COMPLETADO":
        return "Completado";
      case "CANCELADO":
        return "Cancelado";
      case "APROBADA":
        return "Aprobada";
      case "PENDIENTE":
        return "Pendiente";
      case "RECHAZADA":
        return "Rechazada";
      default:
        return estado;
    }
  };

  // Función para obtener el icono según el tipo de transporte
  const getTransporteIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("marítimo") || tipoLower.includes("maritimo")) {
      return <Ship className="h-6 w-6 text-blue-400" />;
    }
    if (tipoLower.includes("aéreo") || tipoLower.includes("aereo")) {
      return <Plane className="h-6 w-6 text-purple-400" />;
    }
    if (tipoLower.includes("terrestre") || tipoLower.includes("terrrestre")) {
      return <Truck className="h-6 w-6 text-green-400" />;
    }
    return <Package className="h-6 w-6 text-gray-400" />;
  };

  // Función para obtener el color según el tipo de transporte
  const getTransporteColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("marítimo") || tipoLower.includes("maritimo")) {
      return "bg-blue-900";
    }
    if (tipoLower.includes("aéreo") || tipoLower.includes("aereo")) {
      return "bg-purple-900";
    }
    if (tipoLower.includes("terrestre") || tipoLower.includes("terrrestre")) {
      return "bg-green-900";
    }
    return "bg-gray-900";
  };

  // Función para manejar la solicitud de unirse al grupo
  const handleSolicitarUnirse = async (proformaId: string) => {
    try {
      await solicitarUnirseMutation.mutateAsync({
        grupoId: id,
        proformaId,
      });

      setModalUnirseOpen(false);
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud para unirte al grupo ha sido enviada",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para aprobar/rechazar solicitudes
  const handleGestionarSolicitud = async (
    solicitudId: string,
    estado: "APROBADA" | "RECHAZADA"
  ) => {
    try {
      await gestionarSolicitudMutation.mutateAsync({
        id: solicitudId,
        estado,
      });

      toast({
        title:
          estado === "APROBADA" ? "Solicitud aprobada" : "Solicitud rechazada",
        description: `La solicitud ha sido ${
          estado === "APROBADA" ? "aprobada" : "rechazada"
        } exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4">
          <Button
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
            onClick={() => router.push("/grupos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Grupos
          </Button>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando grupo...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4">
          <Button
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
            onClick={() => router.push("/grupos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Grupos
          </Button>
          <Alert className="border-red-500 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar el grupo.
              <Button
                variant="link"
                className="p-0 ml-2 text-red-400"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4">
          <Button
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
            onClick={() => router.push("/grupos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Grupos
          </Button>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No se encontró el grupo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const capacidadTotal = grupo.transporte.capacidadCBM;
  const cbmOcupado = capacidadTotal - grupo.cbmDisponible;
  const porcentajeOcupado = (cbmOcupado / capacidadTotal) * 100;
  const estadoColor = getEstadoColor(grupo.estado);
  const estadoTexto = getEstadoText(grupo.estado);
  const transporteIcon = getTransporteIcon(grupo.transporte.tipo);
  const transporteColor = getTransporteColor(grupo.transporte.tipo);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => router.push("/grupos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{grupo.nombre}</h1>
            <p className="text-gray-400">
              Creado el {safeFormatDate(grupo.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {
              estadoTexto === "Disponible" && (
                <Button
              variant="outline"
              size="sm"
              onClick={() => setModalUnirseOpen(true)}
              className="text-white border-gray-700 hover:bg-gray-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Solicitar Unirse
            </Button>
              )
            }
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-gray-700 hover:bg-gray-700"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <Info className="h-4 w-4 mr-2" />
                  Ver Detalles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Información del grupo y ocupación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Información general */}
          <Card className="border-gray-700 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tipo de Transporte:</span>
                <div className="flex items-center gap-2">
                  {transporteIcon}
                  <span className="text-white">{grupo.transporte.tipo}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Estado:</span>
                <Badge className={`${estadoColor} text-white`}>
                  {estadoTexto}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fecha de Inicio:</span>
                <span className="text-white">
                  {format(new Date(grupo.fechaInicio), "dd/MMM/yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fecha de Fin:</span>
                <span className="text-white">
                  {format(new Date(grupo.fechaFin), "dd/MMM/yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fecha de Creación:</span>
                <span className="text-white">
                  {format(new Date(grupo.createdAt), "dd/MMM/yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Proformas:</span>
                <span className="text-white">{grupo.proformas.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Solicitudes:</span>
                <span className="text-white">{grupo.solicitudes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Capacidad Total:</span>
                <span className="text-white">{capacidadTotal} CBM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Capacidad Ocupada:</span>
                <span className="text-white">{cbmOcupado.toFixed(1)} CBM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Capacidad Disponible:</span>
                <span className="text-white">
                  {grupo.cbmDisponible.toFixed(1)} CBM
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ocupación */}
          <Card className="border-gray-700 bg-gray-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-400" />
                Ocupación de Metros Cúbicos (CBM)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Ocupación</span>
                  <span className="text-white font-medium">
                    {cbmOcupado.toFixed(1)} / {capacidadTotal} CBM (
                    {porcentajeOcupado.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={porcentajeOcupado}
                  className="h-2 bg-gray-700"
                />
              </div>

              {/* Representación visual de CBM como cuadrados */}
              <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
                <div className="flex flex-wrap">
                  {renderCBMSquares(capacidadTotal, grupo.cbmDisponible)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span className="text-gray-400">CBM Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
                  <span className="text-gray-400">
                    CBM Parcialmente Ocupado
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                  <span className="text-gray-400">CBM Disponible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Imagen del transporte */}
        <Card className="border-gray-700 bg-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {transporteIcon}
              Transporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <img
                  src={grupo.transporte.imagen || "/placeholder.svg"}
                  alt={`${grupo.transporte.tipo}`}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white">{grupo.transporte.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tipo:</span>
                  <div className="flex items-center gap-2">
                    {transporteIcon}
                    <span className="text-white">{grupo.transporte.tipo}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Capacidad:</span>
                  <span className="text-white">
                    {grupo.transporte.capacidadCBM} CBM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Estado:</span>
                  <Badge className={getEstadoColor(grupo.transporte.estado)}>
                    {getEstadoText(grupo.transporte.estado)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Activo:</span>
                  <Badge
                    variant={
                      grupo.transporte.activo ? "default" : "destructive"
                    }
                  >
                    {grupo.transporte.activo ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para proformas, solicitudes y actividad */}
        <Tabs defaultValue="proformas" className="mb-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger
              value="proformas"
              className="data-[state=active]:bg-blue-600"
            >
              <FileText className="h-4 w-4 mr-2" />
              Proformas ({grupo.proformas.length})
            </TabsTrigger>
            <TabsTrigger
              value="solicitudes"
              className="data-[state=active]:bg-blue-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Solicitudes ({grupo.solicitudes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proformas">
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="pt-6">
                {grupo.proformas.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-gray-800">
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Usuario</TableHead>
                        <TableHead className="text-gray-400">
                          Proforma
                        </TableHead>
                        <TableHead className="text-gray-400">CBM</TableHead>
                        <TableHead className="text-gray-400">Fecha</TableHead>
                        <TableHead className="text-gray-400">Estado</TableHead>
                        <TableHead className="text-gray-400 text-right">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grupo.proformas.map((proforma) => (
                        <TableRow key={proforma.id} className="border-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {proforma.proforma?.usuario?.avatar && (
                                  <AvatarImage
                                    src={
                                      proforma.proforma.usuario.avatar ||
                                      "/placeholder.svg"
                                    }
                                    alt={proforma.proforma.usuario.nombre}
                                  />
                                )}
                                <AvatarFallback className="bg-gray-700 text-gray-300">
                                  {proforma.proforma?.usuario?.nombre?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">
                                {proforma.proforma?.usuario?.nombre + " " + proforma.proforma?.usuario?.apellido || "Usuario"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {proforma.proforma?.nombre} 
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {proforma.proforma?.cbmTotal?.toFixed(1) || "0"} CBM
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {safeFormatDate(proforma.fechaAsignacion)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getEstadoColor(
                                proforma.estado
                              )} text-white`}
                            >
                              {getEstadoText(proforma.estado)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No hay proformas asociadas a este grupo
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solicitudes">
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="pt-6">
                {grupo.solicitudes.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-gray-800">
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Usuario</TableHead>
                        <TableHead className="text-gray-400">
                          Proforma
                        </TableHead>
                        <TableHead className="text-gray-400">CBM</TableHead>
                        <TableHead className="text-gray-400">Fecha</TableHead>
                        <TableHead className="text-gray-400">Estado</TableHead>
                        <TableHead className="text-gray-400 text-right">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grupo.solicitudes.map((solicitud) => (
                        <TableRow
                          key={solicitud.id}
                          className="border-gray-700"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {solicitud.usuario?.avatar && (
                                  <AvatarImage
                                    src={
                                      solicitud.usuario.avatar ||
                                      "/placeholder.svg"
                                    }
                                    alt={solicitud.usuario.nombre}
                                  />
                                )}
                                <AvatarFallback className="bg-gray-700 text-gray-300">
                                  {solicitud.usuario?.nombre?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">
                                {solicitud.usuario?.nombre || "Usuario"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {solicitud.proforma?.nombre || "Proforma"}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {solicitud.proforma?.cbmTotal?.toFixed(1) || "0"} CBM
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {safeFormatDate(solicitud.fechaCreacion)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getEstadoColor(
                                solicitud.estado
                              )} text-white`}
                            >
                              {getEstadoText(solicitud.estado)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {solicitud.estado === "PENDIENTE" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-900 bg-opacity-20 text-green-400 border-green-900 hover:bg-green-900 hover:bg-opacity-30"
                                  onClick={() =>
                                    handleGestionarSolicitud(
                                      solicitud.id,
                                      "APROBADA"
                                    )
                                  }
                                  disabled={
                                    gestionarSolicitudMutation.isPending
                                  }
                                >
                                  {gestionarSolicitudMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Aprobar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-900 bg-opacity-20 text-red-400 border-red-900 hover:bg-red-900 hover:bg-opacity-30"
                                  onClick={() =>
                                    handleGestionarSolicitud(
                                      solicitud.id,
                                      "RECHAZADA"
                                    )
                                  }
                                  disabled={
                                    gestionarSolicitudMutation.isPending
                                  }
                                >
                                  {gestionarSolicitudMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No hay solicitudes pendientes para este grupo
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="border-gray-700 bg-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Información del Transporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-medium mb-2">
                  Detalles de Envío
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Origen:</span> China
                    (Guangzhou)
                  </p>
                  <p>
                    <span className="text-gray-400">Destino:</span> Bolivia
                    (Santa Cruz)
                  </p>
                  <p>
                    <span className="text-gray-400">
                      Fecha estimada de salida:
                    </span>{" "}
                    {format(new Date(grupo.fechaInicio), "dd/MMM/yyyy", {
                      locale: es,
                    })}
                  </p>
                  <p>
                    <span className="text-gray-400">
                      Fecha estimada de llegada:
                    </span>{" "}
                    {format(new Date(grupo.fechaFin), "dd/MMM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">
                  Costos y Tarifas
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Precio por CBM:</span> $
                    {grupo.transporte.tipo.toLowerCase() === "maritimo"
                      ? "215"
                      : grupo.transporte.tipo.toLowerCase() === "aereo"
                      ? "450"
                      : "180"}
                  </p>
                  <p>
                    <span className="text-gray-400">Gastos de aduana:</span>{" "}
                    Incluidos
                  </p>
                  <p>
                    <span className="text-gray-400">Seguro de carga:</span>{" "}
                    Opcional
                  </p>
                  <p>
                    <span className="text-gray-400">Método de pago:</span>{" "}
                    Transferencia bancaria / Depósito
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para solicitar unirse al grupo */}
      <SolicitarUnirseModal
        open={modalUnirseOpen}
        onOpenChange={setModalUnirseOpen}
        grupo={grupo}
        onSubmit={handleSolicitarUnirse}
      />
    </div>
  );
}
