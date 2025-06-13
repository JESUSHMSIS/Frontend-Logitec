"use client";

import { useState } from "react";
import {
  Search,
  MoreVertical,
  Ship,
  Plane,
  Package,
  Plus,
  Users,
  Filter,
  Truck,
  Loader2,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import NuevoGrupoModal from "@/components/nuevo-grupo-modal";
import TransportesTable from "@/components/tranportes-table";
import { useRouter } from "next/navigation";
import { useGrupos, useCreateGrupo } from "@/hooks/api/grupos";
import type { GrupoAPI, CreateGrupoRequest, GrupoFilters } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
export default function Grupos() {
  const router = useRouter();
  const { toast } = useToast();
  const {usuario} = useAuth()
  const [filtroTransporte, setFiltroTransporte] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("grupos");

  // Construir filtros para la API
  const filtros: GrupoFilters = {
    ...(filtroTransporte !== "Todos" && { tipo: filtroTransporte }),
    ...(filtroEstado !== "Todos" && { estado: filtroEstado }),
    ...(busqueda && { search: busqueda }),
  };

  // React Query hooks
  const {
    data: gruposResponse,
    isLoading,
    error,
    refetch,
  } = useGrupos(filtros);

  const createGrupoMutation = useCreateGrupo();

  // Asegurarnos de que grupos sea un array
  const grupos = gruposResponse?.data || [];
  
  console.log('Respuesta de la API:', gruposResponse);
  console.log('Grupos:', grupos);

  // Agrupar por tipo de transporte
  const gruposMaritimos = grupos.filter(
    (grupo) => grupo.transporte.tipo.toLowerCase().includes("marítimo") || grupo.transporte.tipo.toLowerCase().includes("maritimo")
  );
  const gruposAereos = grupos.filter(
    (grupo) => grupo.transporte.tipo.toLowerCase().includes("aéreo") || grupo.transporte.tipo.toLowerCase().includes("aereo")
  );
  const gruposTerrestres = grupos.filter(
    (grupo) => grupo.transporte.tipo.toLowerCase().includes("terrestre") || grupo.transporte.tipo.toLowerCase().includes("terrrestre")
  );

  console.log('Grupos Marítimos:', gruposMaritimos);
  console.log('Grupos Aéreos:', gruposAereos);
  console.log('Grupos Terrestres:', gruposTerrestres);

  const handleNuevoGrupo = async (data: CreateGrupoRequest) => {
    try {
      await createGrupoMutation.mutateAsync(data);
      setModalOpen(false);
      toast({
        title: "Grupo creado",
        description: "El grupo se ha creado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el grupo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para renderizar los cuadrados de CBM
  const renderCBMSquares = (capacidadTotal: number, cbmDisponible: number) => {
    const squares = [];
    const cbmOcupado = capacidadTotal - cbmDisponible;
    const fullSquares = Math.floor(cbmOcupado);
    const partialSquare = cbmOcupado - fullSquares > 0;
    const emptySquares = Math.floor(cbmDisponible) - (partialSquare ? 1 : 0);

    // Cuadrados ocupados
    for (let i = 0; i < fullSquares; i++) {
      squares.push(
        <div
          key={`full-${i}`}
          className="w-6 h-6 bg-blue-500 rounded-sm m-0.5 flex items-center justify-center text-xs text-white font-medium"
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
          className="w-6 h-6 bg-blue-300 rounded-sm m-0.5 flex items-center justify-center text-xs text-blue-900 font-medium"
          title={`${partialValue.toFixed(2)} CBM ocupado`}
        >
          {partialValue.toFixed(1)}
        </div>
      );
    }

    // Cuadrados vacíos
    for (let i = 0; i < emptySquares; i++) {
      squares.push(
        <div
          key={`empty-${i}`}
          className="w-6 h-6 bg-gray-200 rounded-sm m-0.5 flex items-center justify-center text-xs text-gray-500"
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
      default:
        return estado;
    }
  };

  // Función para obtener el icono del transporte
  const getTipoIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("marítimo") || tipoLower.includes("maritimo")) {
      return Ship;
    }
    if (tipoLower.includes("aéreo") || tipoLower.includes("aereo")) {
      return Plane;
    }
    if (tipoLower.includes("terrestre") || tipoLower.includes("terrrestre")) {
      return Truck;
    }
    return Package;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando grupos...</span>
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
          <Alert className="border-red-500 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar los grupos.
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-800 p-2 rounded-md">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              GRUPOS Y TRANSPORTES
            </h1>
            <p className="text-sm text-gray-400">
              Gestiona grupos de transporte y tipos de transporte
            </p>
          </div>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger
              value="grupos"
              className="data-[state=active]:bg-blue-600"
            >
              <Users className="h-4 w-4 mr-2" />
              Grupos
            </TabsTrigger>

            {(usuario?.tipoUsuario === "Admin" || usuario?.tipoUsuario === "Gerente logistico") && (
        <TabsTrigger
              value="transportes"
              className="data-[state=active]:bg-blue-600"
            >
              <Package className="h-4 w-4 mr-2" />
              Transportes
            </TabsTrigger>
      )}
            
          </TabsList>

          <TabsContent value="grupos">
            {/* Search and Filter para grupos */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="Buscar Grupo"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filtroTransporte}
                  onValueChange={setFiltroTransporte}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Transporte</span>
                      <SelectValue placeholder="Todos" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Marítimo">Marítimo</SelectItem>
                    <SelectItem value="Aéreo">Aéreo</SelectItem>
                    <SelectItem value="Terrestre">Terrestre</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Estado</span>
                      <SelectValue placeholder="Todos" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                    <SelectItem value="EN_CURSO">En Curso</SelectItem>
                    <SelectItem value="COMPLETADO">Completado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            {/* Tabs de tipos de transporte */}
            <Tabs defaultValue="todos" className="mb-6">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger
                  value="todos"
                  className="data-[state=active]:bg-blue-600"
                >
                  Todos ({grupos.length})
                </TabsTrigger>
                <TabsTrigger
                  value="maritimo"
                  className="data-[state=active]:bg-blue-600"
                >
                  <Ship className="h-4 w-4 mr-2" />
                  Marítimo ({gruposMaritimos.length})
                </TabsTrigger>
                <TabsTrigger
                  value="aereo"
                  className="data-[state=active]:bg-blue-600"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  Aéreo ({gruposAereos.length})
                </TabsTrigger>
                <TabsTrigger
                  value="terrestre"
                  className="data-[state=active]:bg-blue-600"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Terrestre ({gruposTerrestres.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todos">
                {/* Todas las secciones */}
                {gruposMaritimos.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Ship className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">
                        Grupos Marítimos
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gruposMaritimos.map((grupo) => renderGrupoCard(grupo))}
                    </div>
                  </div>
                )}

                {gruposTerrestres.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Truck className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">
                        Grupos Terrestres
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gruposTerrestres.map((grupo) => renderGrupoCard(grupo))}
                    </div>
                  </div>
                )}

                {gruposAereos.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Plane className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">
                        Grupos Aéreos
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gruposAereos.map((grupo) => renderGrupoCard(grupo))}
                    </div>
                  </div>
                )}

                {/* Nuevo Grupo Card */}
                {(usuario?.tipoUsuario === "Admin" || usuario?.tipoUsuario === "Gerente logistico") && (
        <div className="mt-8">
        <Card className="border border-gray-700 bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center h-64 p-6">
            <div className="bg-gray-700 p-4 rounded-full mb-4">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <Button
              variant="outline"
              className="mt-4 border-gray-600 text-gray-200 hover:bg-gray-700"
              onClick={() => setModalOpen(true)}
              disabled={createGrupoMutation.isPending}
            >
              {createGrupoMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Nuevo Grupo
            </Button>
          </CardContent>
        </Card>
      </div>
      )}
                
              </TabsContent>

              <TabsContent value="maritimo">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gruposMaritimos.map((grupo) => renderGrupoCard(grupo))}
                  <Card className="border border-gray-700 bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                      <div className="bg-gray-700 p-4 rounded-full mb-4">
                        <Ship className="h-10 w-10 text-gray-300" />
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 border-gray-600 text-gray-200 hover:bg-gray-700"
                        onClick={() => setModalOpen(true)}
                        disabled={createGrupoMutation.isPending}
                      >
                        {createGrupoMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Nuevo Grupo Marítimo
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="aereo">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gruposAereos.map((grupo) => renderGrupoCard(grupo))}
                  <Card className="border border-gray-700 bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                      <div className="bg-gray-700 p-4 rounded-full mb-4">
                        <Plane className="h-10 w-10 text-gray-300" />
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 border-gray-600 text-gray-200 hover:bg-gray-700"
                        onClick={() => setModalOpen(true)}
                        disabled={createGrupoMutation.isPending}
                      >
                        {createGrupoMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Nuevo Grupo Aéreo
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="terrestre">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gruposTerrestres.map((grupo) => renderGrupoCard(grupo))}
                  <Card className="border border-gray-700 bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                      <div className="bg-gray-700 p-4 rounded-full mb-4">
                        <Truck className="h-10 w-10 text-gray-300" />
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 border-gray-600 text-gray-200 hover:bg-gray-700"
                        onClick={() => setModalOpen(true)}
                        disabled={createGrupoMutation.isPending}
                      >
                        {createGrupoMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Nuevo Grupo Terrestre
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {(usuario?.tipoUsuario === "Admin" || usuario?.tipoUsuario === "Gerente logistico") && (
        <TabsContent value="transportes">
            <TransportesTable />
          </TabsContent>
      )}
          
        </Tabs>
      </div>

      {/* Modal de Nuevo Grupo */}
      <NuevoGrupoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleNuevoGrupo}
        isLoading={createGrupoMutation.isPending}
      />
    </div>
  );

  // Función para renderizar la tarjeta de grupo
  function renderGrupoCard(grupo: GrupoAPI) {
    const cbmOcupado = grupo.transporte.capacidadCBM - grupo.cbmDisponible;
    const porcentajeOcupado =
      (cbmOcupado / grupo.transporte.capacidadCBM) * 100;
    const estadoColor = getEstadoColor(grupo.estado);
    const estadoTexto = getEstadoText(grupo.estado);
    const IconComponent = getTipoIcon(grupo.transporte.tipo);

    return (
      <Card
        key={grupo.id}
        className="border border-gray-700 bg-gray-800 shadow-sm overflow-hidden"
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                grupo.transporte.tipo.toLowerCase() === "marítimo"
                  ? "bg-blue-900"
                  : grupo.transporte.tipo.toLowerCase() === "aéreo"
                  ? "bg-purple-900"
                  : "bg-green-900"
              }`}
            >
              <IconComponent
                className={`h-5 w-5 ${
                  grupo.transporte.tipo.toLowerCase() === "marítimo"
                    ? "text-blue-400"
                    : grupo.transporte.tipo.toLowerCase() === "aéreo"
                    ? "text-purple-400"
                    : "text-green-400"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{grupo.nombre}</h3>
                <Badge className={`${estadoColor} text-white text-xs`}>
                  {estadoTexto}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">
                Fecha Creado{" "}
                {new Date(grupo.createdAt).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-400">
                Fecha Fin{" "}
                {new Date(grupo.fechaFin).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
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
                onClick={() => router.push(`/grupos/${grupo.id}`)}
              >
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                Cerrar Grupo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Ocupación</span>
              <span className="text-white font-medium">
                {cbmOcupado.toFixed(1)} / {grupo.transporte.capacidadCBM} CBM
              </span>
            </div>
            <Progress value={porcentajeOcupado} className="h-2 bg-gray-700" />
          </div>

          {/* Representación visual de CBM como cuadrados */}
          <div className="border border-gray-700 rounded-md p-3 bg-gray-800 mb-4">
            <h4 className="text-sm text-gray-400 mb-2">Metros Cúbicos (CBM)</h4>
            <div className="flex flex-wrap">
              {renderCBMSquares(
                grupo.transporte.capacidadCBM,
                grupo.cbmDisponible
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 border border-blue-900 rounded-md bg-blue-900 bg-opacity-20">
              <div className="text-blue-400 font-medium">
                {grupo.cbmDisponible}
              </div>
              <p className="text-xs text-gray-400">CBM Disponible</p>
            </div>
            <div className="text-center p-2 border border-blue-900 rounded-md bg-blue-900 bg-opacity-20">
              <div className="text-blue-400 font-medium">
                {grupo.proformas.length}
              </div>
              <p className="text-xs text-gray-400">Proformas</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-0">
          <Button
            variant="outline"
            className="w-full rounded-t-none bg-blue-900 bg-opacity-20 text-blue-400 border-t border-blue-900 hover:bg-blue-900 hover:bg-opacity-30"
            onClick={() => router.push(`/grupos/${grupo.id}`)}
          >
            <Package className="h-4 w-4 mr-2" />
            Ver Grupo
          </Button>
        </CardFooter>
      </Card>
    );
  }
}
