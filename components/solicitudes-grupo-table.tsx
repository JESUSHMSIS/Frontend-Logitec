"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSolicitudesGrupoUsuario } from "@/hooks/useSolicitudesGrupo";
import { useAprobarSolicitud } from "@/hooks/api/grupos";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRechazarSolicitud } from "@/hooks/api/grupos";

export default function SolicitudesGrupoTable() {

  const { data: solicitudes = [], isPending, error, refetch } = useSolicitudesGrupoUsuario();

  const aprobarMutation = useAprobarSolicitud();
  const rechazarMutation = useRechazarSolicitud();

  const handleAprobar = (id: string) => {
    aprobarMutation.mutate({ solicitudId: id }, { onSuccess: () => {
      toast.success("Solicitud aprobada correctamente.");
      refetch();
    },
      onError:()=>{
        toast.error("Error al aprobar la solicitud.");
      }
     });
  };

  const handleRechazar = (id: string) => {
    rechazarMutation.mutate({ solicitudId: id }, { onSuccess: refetch });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grupo</TableHead>
            <TableHead>Transporte</TableHead>
            <TableHead>Proforma</TableHead>
            <TableHead>CBM</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Solicitud</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Cargando...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-red-500">
                Error al cargar solicitudes
              </TableCell>
            </TableRow>
          ) : solicitudes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No hay solicitudes
              </TableCell>
            </TableRow>
          ) : (
            solicitudes.map((solicitud) => (
              <TableRow key={solicitud.id}>
                <TableCell>{solicitud.grupo.nombre}</TableCell>
                <TableCell>{solicitud.grupo.transporte.tipo}</TableCell>
                <TableCell>{solicitud.proforma.nombre}</TableCell>
                <TableCell>{solicitud.proforma.cbmTotal}</TableCell>
                <TableCell>{solicitud.estado}</TableCell>
                <TableCell>
                  {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-2">
                  {solicitud.estado === "PENDIENTE" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAprobar(solicitud.id)}
                        disabled={aprobarMutation.isPending}
                      >
                        {aprobarMutation.isPending ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Aprobar"
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRechazar(solicitud.id)}
                        disabled={rechazarMutation.isPending}
                      >
                        {rechazarMutation.isPending ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Rechazar"
                        )}
                      </Button>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
