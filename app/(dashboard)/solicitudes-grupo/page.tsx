"use client";

import SolicitudesGrupoTable from "@/components/solicitudes-grupo-table";

export default function SolicitudesGrupoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Solicitudes de Grupo</h1>
      <SolicitudesGrupoTable />
    </div>
  );
} 