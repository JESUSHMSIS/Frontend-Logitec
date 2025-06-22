"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useCreateExWork } from "@/hooks/useExWorks";
import { useMetodosPago } from "@/hooks/useMetodosPago";
import {
  Link,
  Building,
  Package,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  FileCheck,
  DollarSign,
  Layers,
  CircleX,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ProformaExwModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    comisionType: string;
    comisionValue: string;
    bancarioValue?: string;
    chatLink: string;
    qualityControl: boolean | null;
    shippingCost: string;
    dispatchExpense: string;
    deconsolidation: string;
    otherExpenses: string;
    sumUsage: string;
    link: string;
  }) => void;
}

export default function ProformaExwModal({
  open,
  onOpenChange,
  onSubmit,
}: ProformaExwModalProps) {
  const params = useParams();
  const proformaId = params?.id as string;
  // const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMetodoPagoId, setSelectedMetodoPagoId] = useState<string>("");
  const [comisionValue, setComisionValue] = useState("2.99");
  const [chatLink, setChatLink] = useState("");

  const [qualityControl, setQualityControl] = useState<boolean | null>(null);
  const [shippingCost, setShippingCost] = useState("0");

  // Step 4 values
  const [dispatchExpense, setDispatchExpense] = useState("56");
  const [deconsolidation, setDeconsolidation] = useState("0");
  const [otherExpenses, setOtherExpenses] = useState("0");
  const [sumUsage, setSumUsage] = useState("0");

  const totalSteps = 5;

  // Obtener métodos de pago desde la API
  const {
    data: metodosPago,
    isLoading: isLoadingMetodosPago,
    error: metodosPagoError,
  } = useMetodosPago();

  // Establecer el método de pago por defecto cuando se cargan los datos
  useEffect(() => {
    if (metodosPago && metodosPago.length > 0 && !selectedMetodoPagoId) {
      setSelectedMetodoPagoId(metodosPago[0].id);
      setComisionValue(metodosPago[0].porcentajeExtra.toString());
    }
  }, [metodosPago, selectedMetodoPagoId]);

  // Usar el hook de creación de exworks
  const [exWorkCreated, setExWorkCreated] = useState<string | null>(null);

  const createExWork = useCreateExWork({
    onSuccess: (data) => {
      toast.success("Proforma EXW creada con éxito");
      setExWorkCreated(data.id); // Guardamos el ID del ExWork creado
      onOpenChange(false);
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateProforma();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateProforma = () => {
    // Verificar que tenemos el ID de la proforma
    if (!proformaId) {
      toast.error("El ID de la proforma no está definido");
      return;
    }

    // Verificar que el control de calidad está definido
    if (qualityControl === null) {
      toast.error("Debes seleccionar si deseas control de calidad");
      return;
    }

    // Verificar que se ha seleccionado un método de pago
    if (!selectedMetodoPagoId) {
      toast.error("Debes seleccionar un método de pago");
      return;
    }

    // Crear el objeto de datos para la API
    const exWorkData = {
      proformaId,
      metodoPagoId: selectedMetodoPagoId,
      controlCalidad: qualityControl,
      costoEnvioAlmacen: parseFloat(shippingCost) || 0,
      gastosDespacho: parseFloat(dispatchExpense) || 0,
      gastosDesconsolidacion: parseFloat(deconsolidation) || 0,
      otrosGastos: parseFloat(otherExpenses) || 0,
      enlaceCompra: chatLink || undefined,
    };

    // Llamar a la mutación para crear el exwork
    createExWork.mutate(exWorkData);

    // Si hay un callback onSubmit, llamarlo también (para compatibilidad con el código existente)
    if (onSubmit) {
      const selectedMetodo = metodosPago?.find(
        (m) => m.id === selectedMetodoPagoId
      );
      onSubmit({
        comisionType: selectedMetodo?.nombre || "",
        comisionValue,
        chatLink,
        qualityControl,
        shippingCost,
        dispatchExpense,
        deconsolidation,
        otherExpenses,
        sumUsage,
        link: chatLink || "https://www.alibaba.com/product-detail/example",
      });
    }

    // Reset form for next time
    setCurrentStep(1);
  };

  // Obtener el nombre del método de pago seleccionado
  const getSelectedMetodoNombre = () => {
    if (!metodosPago) return "";
    const metodo = metodosPago.find((m) => m.id === selectedMetodoPagoId);
    return metodo?.nombre || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-gray-900 p-0 text-white border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <DialogTitle className="text-xl font-bold text-white">
              Nueva Proforma EXW
            </DialogTitle>
            <p className="text-sm text-gray-400">Encabezado de proforma EXW</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between px-8 py-3 border-b border-gray-700">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === currentStep
                    ? "bg-blue-600 text-white"
                    : step < currentStep
                    ? "bg-blue-900 bg-opacity-50 text-blue-400"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {step === 1 && <Link className="h-4 w-4" />}
                {step === 2 && <Building className="h-4 w-4" />}
                {step === 3 && <Package className="h-4 w-4" />}
                {step === 4 && <FileText className="h-4 w-4" />}
                {step === 5 &&
                  (currentStep === 5 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  ))}
              </div>
              <div
                className="w-12 h-0.5 bg-gray-700 absolute"
                style={{ left: `calc(50% + 1.5rem)` }}
              ></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Método de Pago y Enlace */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {isLoadingMetodosPago ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Cargando métodos de pago...</p>
                </div>
              ) : metodosPagoError ? (
                <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-md p-3 text-red-400 mb-4">
                  Error al cargar métodos de pago. Por favor, intente
                  nuevamente.
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Método de Pago
                  </h3>
                  <RadioGroup
                    value={selectedMetodoPagoId}
                    onValueChange={setSelectedMetodoPagoId}
                    className="grid grid-cols-2 gap-4"
                  >
                    {metodosPago &&
                      metodosPago.map((metodo) => (
                        <div
                          key={metodo.id}
                          className={`border rounded-md p-4 cursor-pointer ${
                            selectedMetodoPagoId === metodo.id
                              ? "border-blue-600 bg-blue-900 bg-opacity-20"
                              : "border-gray-700 bg-gray-800"
                          }`}
                        >
                          <RadioGroupItem
                            value={metodo.id}
                            id={metodo.id}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={metodo.id}
                            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                          >
                            {metodo.nombre === "Alibaba" ? (
                              <DollarSign className="h-6 w-6 text-blue-400" />
                            ) : (
                              <Building className="h-6 w-6 text-blue-400" />
                            )}
                            <span
                              className={
                                selectedMetodoPagoId === metodo.id
                                  ? "text-blue-400"
                                  : "text-gray-300"
                              }
                            >
                              {metodo.nombre}
                            </span>
                            <span className="text-xs text-gray-400">
                              {metodo.porcentajeExtra}% extra
                            </span>
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Enlace de Chat
                </h3>
                <div className="relative">
                  <Input
                    value={chatLink}
                    onChange={(e) => setChatLink(e.target.value)}
                    placeholder="Ingrese el enlace de chat"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Link className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Control de Calidad */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  ¿Desea Control de Calidad?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    onClick={() => setQualityControl(true)}
                    className={`p-6 h-auto flex flex-col items-center justify-center gap-3 ${
                      qualityControl === true
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                    }`}
                  >
                    <CheckCircle2 className="h-8 w-8" />
                    <span className="text-lg">Sí</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setQualityControl(false)}
                    className={`p-6 h-auto flex flex-col items-center justify-center gap-3 ${
                      qualityControl === false
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                    }`}
                  >
                    <CircleX className="h-8 w-8" />
                    <span className="text-lg">No</span>
                  </Button>
                </div>
                <p className="mt-2">Si escoge "Si" tiene un 3% mas de costo</p>
              </div>
            </div>
          )}

          {/* Step 3: Costo de Envío */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Costo de Envío al Almacén
                </h3>
                <div className="relative">
                  <Input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="Ingrese el costo de envío"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    step="0.01"
                    min="0"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Gastos Adicionales - Ahora en 2 filas de 2 inputs */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Primera fila: 2 inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Gastos de Despacho
                  </h3>
                  <div className="relative">
                    <Input
                      type="number"
                      value={dispatchExpense}
                      onChange={(e) => setDispatchExpense(e.target.value)}
                      placeholder="Gastos de despacho"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      step="0.01"
                      min="0"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Gastos de Desconsolidación
                  </h3>
                  <div className="relative">
                    <Input
                      type="number"
                      value={deconsolidation}
                      onChange={(e) => setDeconsolidation(e.target.value)}
                      placeholder="Desconsolidación"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      step="0.01"
                      min="0"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Segunda fila: 2 inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Otros Gastos
                  </h3>
                  <div className="relative">
                    <Input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(e.target.value)}
                      placeholder="Otros gastos"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      step="0.01"
                      min="0"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Uso de Suma
                  </h3>
                  <div className="relative">
                    <Input
                      type="number"
                      value={sumUsage}
                      onChange={(e) => setSumUsage(e.target.value)}
                      placeholder="Uso de suma"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      step="0.01"
                      min="0"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Resumen */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Resumen de la Proforma EXW
              </h3>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Método de Pago:</span>
                  <span className="text-white font-medium">
                    {getSelectedMetodoNombre()}
                  </span>
                </div>
                {chatLink && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Enlace de Chat:</span>
                    <span className="text-blue-400 underline truncate max-w-[200px]">
                      {chatLink}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Control de Calidad:</span>
                  <span
                    className={`font-medium ${
                      qualityControl ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {qualityControl ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Costo de Envío:</span>
                  <span className="text-white font-medium">
                    ${shippingCost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gastos de Despacho:</span>
                  <span className="text-white font-medium">
                    ${dispatchExpense}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Gastos de Desconsolidación:
                  </span>
                  <span className="text-white font-medium">
                    ${deconsolidation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Otros Gastos:</span>
                  <span className="text-white font-medium">
                    ${otherExpenses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uso de Suma:</span>
                  <span className="text-white font-medium">${sumUsage}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-700 flex justify-between">
                  <span className="text-gray-300 font-medium">
                    Total Estimado:
                  </span>
                  <span className="text-green-400 font-bold">
                    $
                    {(
                      parseFloat(shippingCost || "0") +
                      parseFloat(dispatchExpense || "0") +
                      parseFloat(deconsolidation || "0") +
                      parseFloat(otherExpenses || "0") +
                      parseFloat(sumUsage || "0")
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`${
              currentStep === 1 ? "opacity-50" : ""
            } border-gray-700 text-gray-300 hover:bg-gray-800`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateProforma}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={createExWork.isPending}
            >
              {createExWork.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Crear Proforma
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
