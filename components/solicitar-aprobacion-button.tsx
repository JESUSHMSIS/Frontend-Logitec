import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { useSolicitarAprobacion } from "@/hooks/useProformas";
import { toast } from "sonner";

interface SolicitarAprobacionButtonProps {
  proformaId: string;
  onSuccess?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function SolicitarAprobacionButton({
  proformaId,
  onSuccess,
  className = "bg-green-900 bg-opacity-20 text-green-400 border-green-800 hover:bg-green-900 hover:bg-opacity-30",
  size = "sm",
  variant = "outline",
}: SolicitarAprobacionButtonProps) {
  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [comentario, setComentario] = useState("");

  // Hook para solicitar aprobación
  const { mutate: solicitarAprobacion, isPending } = useSolicitarAprobacion({
    onSuccess: (data) => {
      // Cerrar el modal
      toast.success("Solicitud de aprobación enviada con éxito");
      setModalOpen(false);
      setComentario("");

      // Llamar al callback si existe
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast.error("Error al enviar la solicitud de aprobación");
      console.error("Error al solicitar aprobación:", error);
    },
  });

  // Función para manejar la solicitud
  const handleSolicitarAprobacion = () => {
    if (!comentario.trim()) {
      alert("Por favor ingrese un comentario");
      return;
    }

    solicitarAprobacion({
      proformaId,
      comentario,
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setModalOpen(true)}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Solicitar Aprobación
      </Button>

      {/* Modal de Solicitud de Aprobación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Solicitar Aprobación</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ingrese un comentario para la solicitud de aprobación.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Ej: Quiero que me aprueben esta cotización"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-900 bg-opacity-80 text-green-100 hover:bg-green-800"
              onClick={handleSolicitarAprobacion}
              disabled={isPending || !comentario.trim()}
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Enviando...
                </>
              ) : (
                <>Enviar Solicitud</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
