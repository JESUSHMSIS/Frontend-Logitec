import { useQuery } from "@tanstack/react-query";
import axios from "axios";



const BaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173";

export interface SolicitudGrupo {
  id: string;
  estado: string;
  fechaSolicitud: string;
  fechaRespuesta?: string | null;
  comentario?: string | null;
  grupo: {
    id: string;
    nombre: string;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
    cbmDisponible: number;
    transporte: {
      id: string;
      tipo: string;
      capacidadCBM: number;
      imagen?: string;
    };
  };
  proforma: {
    id: string;
    nombre: string;
    cbmTotal: number;
    precioCBM: number;
    estadoAprobacion: string;
  };
}

async function fetchSolicitudesGrupoUsuario() {
  const token = localStorage.getItem("access_token");
  const { data } = await axios.get(`${BaseUrl}/api/grupos-transporte/usuario/solicitudes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(data) ? data : [data];
}

export function useSolicitudesGrupoUsuario() {
  return useQuery<SolicitudGrupo[]>({
    queryKey: ["solicitudes-grupo-usuario"],
    queryFn: fetchSolicitudesGrupoUsuario,
  });
} 