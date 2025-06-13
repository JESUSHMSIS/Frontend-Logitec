"use client";

import type React from "react";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Download, Save } from "lucide-react";
import { useCreateProductoExWork } from "@/hooks/useProductosExWork";
import { toast } from "sonner";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductData) => void;
  proformaId: string;
  exWorkId?: string; // Añadir exWorkId como prop opcional
}

export type ProductData = {
  id: string;
  description: string;
  hsCode: string;
  quantity: number;
  unitPrice: number;
  totalCBM: number;
  ga: number;
  iva: number;
  ice: number;
  image?: string | undefined | null;
};

export default function AddProductModal({
  open,
  onOpenChange,
  onSave,
  proformaId,
  exWorkId,
}: AddProductModalProps) {
  const [description, setDescription] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalCBM, setTotalCBM] = useState("");
  const [ga, setGa] = useState("0");
  const [iva, setIva] = useState("14.94");
  const [ice, setIce] = useState("0");
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); // Nuevo estado para el archivo

  // Usar el hook de creación de productos ExWork si se proporciona un exWorkId
  const createProductoExWork = useCreateProductoExWork({
    onSuccess: (data) => {
      toast.success("Producto creado con éxito");
      resetForm();
      onOpenChange(false);

      // Convertir el formato de datos para mantener compatibilidad con el componente existente
      const productData: ProductData = {
        id: data.id || Date.now().toString(),
        description: data.descripcion,
        hsCode: data.hsCode,
        quantity: data.cantidad,
        unitPrice: data.precioUnitario,
        totalCBM: data.totalCbm,
        ga: Number(ga),
        iva: Number(iva),
        ice: Number(ice),
        image: data.imagen,
      };

      // Llamar al callback onSave con el formato esperado
      onSave(productData);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Guardar el archivo para enviarlo al servidor
      setFile(selectedFile);
      
      // Mostrar una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = () => {
    if (!description || !hsCode || !quantity || !unitPrice || !totalCBM) {
      toast.error("Por favor, complete todos los campos requeridos");
      return;
    }

    // Crear el objeto de datos para la API
    const productoData = {
      exWorksId: exWorkId, // Asegurarnos de que este ID viene de la proforma ExWork
      descripcion: description,
      hsCode: hsCode,
      cantidad: Number(quantity),
      precioUnitario: Number(unitPrice),
      totalCbm: Number(totalCBM),
      ga: Number(ga),
      iva: Number(iva),
      ice: Number(ice),
      file: file || undefined, // Usar el archivo en lugar de la imagen base64
    };

    // Siempre usar la mutación para crear el producto
    createProductoExWork.mutate(productoData);
  };

  const resetForm = () => {
    setDescription("");
    setHsCode("");
    setQuantity("");
    setUnitPrice("");
    setTotalCBM("");
    setGa("0");
    setIva("14.94");
    setIce("0");
    setImage(null);
    setFile(null); // Resetear también el archivo
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white p-0 border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <DialogTitle className="text-xl font-bold text-white">
              {exWorkId ? "Nuevo Producto ExWork" : "Nuevo Producto"}
            </DialogTitle>
            <p className="text-sm text-gray-400">
              {exWorkId
                ? "Registra los productos de tu ExWork"
                : "Registra los productos de tu proforma"}
            </p>
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

        <div className="p-4 space-y-4">
          {/* Image Upload */}
          <div
            className="border border-gray-700 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => document.getElementById("product-image")?.click()}
          >
            {image ? (
              <img
                src={image || "/placeholder.svg"}
                alt="Product preview"
                className="max-h-32 object-contain"
              />
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-500 mb-2" />
                <span className="text-gray-500">Imagen de Producto</span>
              </>
            )}
            <input
              type="file"
              id="product-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-400 text-sm">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M6 8H18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 12H18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 16H12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nombre o descripción del producto..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-4 gap-4">
            {/* HS Code */}
            <div>
              <Label htmlFor="hsCode" className="text-gray-400 text-sm">
                HS Code <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <path
                      d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M7 7H7.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 12H7.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 17H7.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 7H17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 12H17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 17H17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Input
                  id="hsCode"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder="Código ..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="text-gray-400 text-sm">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 12H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 8L12 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Cantidad..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            {/* Unit Price */}
            <div>
              <Label htmlFor="unitPrice" className="text-gray-400 text-sm">
                Precio Un. <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 6V18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 14H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="Precio p..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            {/* Total CBM */}
            <div>
              <Label htmlFor="totalCBM" className="text-gray-400 text-sm">
                Total CBM <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 8H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 12H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 16H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Input
                  id="totalCBM"
                  type="number"
                  step="0.01"
                  value={totalCBM}
                  onChange={(e) => setTotalCBM(e.target.value)}
                  placeholder="CBM ocu..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tributos Section */}
          <div>
            <h3 className="text-gray-400 text-sm mb-2">Tributos</h3>
            <div className="grid grid-cols-3 gap-4">
              {/* GA % */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 text-lg">%</span>
                </div>
                <Input
                  value={ga}
                  onChange={(e) => setGa(e.target.value)}
                  placeholder="0%..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-xs">GA %</span>
                </div>
              </div>

              {/* IVA % */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 text-lg">%</span>
                </div>
                <Input
                  value={iva}
                  onChange={(e) => setIva(e.target.value)}
                  placeholder="14.94"
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-xs">IVA %</span>
                </div>
              </div>

              {/* ICE % */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 text-lg">%</span>
                </div>
                <Input
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                  placeholder="0%..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-xs">ICE %</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Link */}
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400">Accede al</span>
            <a
              href="#"
              className="text-blue-400 flex items-center hover:underline"
            >
              PDF Aduanero
              <Download className="h-3 w-3 ml-1" />
            </a>
            <span className="text-gray-400">o puedes verlo</span>
            <a href="#" className="text-blue-400 hover:underline">
              aquí
            </a>
            <span className="text-gray-400">.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 gap-2 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={exWorkId ? createProductoExWork.isPending : false}
          >
            {exWorkId && createProductoExWork.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Producto
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
