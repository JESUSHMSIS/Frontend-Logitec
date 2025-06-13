import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";
type Props = {
  proformaId: string;
};
export function RejectButton({ proformaId }: Props) {
  const handleReject = async () => {
    try {
      await axios.post(
        `http://localhost:5173/api/proformas/${proformaId}/rechazar`,
        {
          comentario: "Cotizacion rechazada",
        }
      );
      alert("Proforma rechazada");
    } catch (error) {
      console.error("Error rejecting proforma", error);
    }
  };

  return (
    <Button variant={"destructive"} onClick={handleReject}>
      Rechazar
    </Button>
  );
}

export function AcceptButton({ proformaId }: Props) {
  const handleAccept = async () => {
    try {
      await axios.post(
        `http://localhost:5173/api/proformas/${proformaId}/aprobar`,
        {
          comentario: "Cotizacion aprobada",
        }
      );
      toast.success("Proforma aprobada");
    } catch (error) {
      toast.error("Error al aprobar la proforma");
      console.error("Error rejecting proforma", error);
    }
  };

  return (
    <Button variant={"success"} onClick={handleAccept}>
      Aprobar
    </Button>
  );
}
