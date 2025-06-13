"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Package,
  MoreVertical,
  DollarSign,
  Info,
  FileText,
  Briefcase,
  Share2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ProformaExwModal from "@/components/proforma-exw-modal";
import ProductListModal from "@/components/product-list-modal";
import ProformaSummary from "@/components/proforma-summary";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import type { ProductData } from "@/components/add-product-modal";
import type { Cotizacion } from "@/app/(dashboard)/cotizaciones/page";
import {
  useProformaDetail,
  AdaptedProformaData,
} from "@/hooks/useProformaDetail";
import SolicitarAprobacionButton from "@/components/solicitar-aprobacion-button";
import ProformaDocumentsModal from "@/components/ProformaDocumentsModal";
import { useProformaDocuments } from "@/hooks/useProformaDocuments";

type ProformaData = {
  id: string;
  comisionType: "alibaba" | "bancaria";
  comisionValue: string;
  qualityControl: boolean | null;
  shippingCost: string;
  dispatchExpense: string;
  deconsolidation: string;
  otherExpenses: string;
  sumUsage: string;
  link: string;
  createdAt: string;
  products: ProductData[];
};

export default function CotizacionDetalle() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [proformaModalOpen, setProformaModalOpen] = useState(false);
  const [productListModalOpen, setProductListModalOpen] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState<ProformaData | null>(
    null
  );
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedProformaId, setSelectedProformaId] = useState<string | null>(
    null
  );
  // Obtenemos datos de la API a través del hook
  const {
    isLoading,
    error,
    cotizacion: apiCotizacion,
    proformas: apiProformas,
    proformaDetalle,
  } = useProformaDetail(id);

  // Creamos estados locales para poder modificarlos
  const [cotizacion, setCotizacion] = useState<typeof apiCotizacion>(null);
  const [proformas, setProformas] = useState<typeof apiProformas>([]);
  // Actualizamos los estados locales cuando cambian los datos de la API
  useEffect(() => {
    if (apiCotizacion) {
      setCotizacion(apiCotizacion);
    }
    if (apiProformas) {
      setProformas(apiProformas);
    }
  }, [apiCotizacion, apiProformas]);
  const handleOpenDocumentsModal = (proformaId: string) => {
    console.log("Opening modal with proformaId:", proformaId); // Agregar este log
    setSelectedProformaId(proformaId);
    setDocumentsModalOpen(true);
  };
  const handleCreateProforma = (
    data: Omit<ProformaData, "id" | "createdAt" | "products">
  ) => {
    const newProforma: ProformaData = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      products: [],
    };

    // Convertir el tipo antes de asignarlo
    const updatedProformas = [...proformas, newProforma].map((proforma) => ({
      ...proforma,
      products: proforma.products.map((product) => ({
        ...product,
        // Convertir undefined a null para la propiedad image
        image: product.image === undefined ? null : product.image,
      })),
    }));

    setProformas(updatedProformas as AdaptedProformaData[]);

    // Aquí deberías hacer una llamada a la API para guardar la nueva proforma
    // TODO: Implementar llamada a la API para guardar la proforma

    setProformaModalOpen(false);
  };

  const handleOpenProductList = (proforma: ProformaData) => {
    setSelectedProforma(proforma);
    setProductListModalOpen(true);
  };

  const handleAddProduct = (product: ProductData) => {
    if (!selectedProforma) return;

    // Convertir el producto para que sea compatible
    const adaptedProduct = {
      ...product,
      image: product.image === undefined ? null : product.image,
    };

    const updatedProformas = proformas.map((p) => {
      if (p.id === selectedProforma.id) {
        return {
          ...p,
          products: [...p.products, adaptedProduct],
        };
      }
      return p;
    });

    setProformas(updatedProformas as AdaptedProformaData[]);

    // TODO: Implementar llamada a la API para guardar el producto

    setSelectedProforma((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        products: [...prev.products, product],
      };
    });

    // Actualizar CBM de la cotización
    if (cotizacion) {
      const totalCBM = updatedProformas.reduce((sum, proforma) => {
        const proformaCBM = proforma.products.reduce(
          (s, product) => s + product.totalCBM,
          0
        );
        return sum + proformaCBM;
      }, 0);

      if (totalCBM > 0) {
        const updatedCotizacion = { ...cotizacion, cbm: totalCBM };
        setCotizacion(updatedCotizacion);

        // TODO: Implementar llamada a la API para actualizar el CBM de la cotización
      }
    }
  };

  const handleAddMultipleProducts = (products: ProductData[]) => {
    if (!selectedProforma) return;

    // Convertir los productos para que sean compatibles
    const adaptedProducts = products.map((product) => ({
      ...product,
      image: product.image === undefined ? null : product.image,
    }));

    const updatedProformas = proformas.map((p) => {
      if (p.id === selectedProforma.id) {
        return {
          ...p,
          products: [...p.products, ...adaptedProducts],
        };
      }
      return p;
    });

    // Usar el casting para asegurar compatibilidad de tipos
    setProformas(updatedProformas as AdaptedProformaData[]);

    // TODO: Implementar llamada a la API para guardar múltiples productos

    setSelectedProforma((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        products: [...prev.products, ...adaptedProducts],
      };
    });

    // Actualizar CBM de la cotización
    if (cotizacion) {
      const totalCBM = updatedProformas.reduce((sum, proforma) => {
        const proformaCBM = proforma.products.reduce(
          (s, product) => s + product.totalCBM,
          0
        );
        return sum + proformaCBM;
      }, 0);

      if (totalCBM > 0) {
        const updatedCotizacion = { ...cotizacion, cbm: totalCBM };
        setCotizacion(updatedCotizacion);

        // TODO: Implementar llamada a la API para actualizar el CBM de la cotización
      }
    }
  };

  const handleEditProduct = (product: ProductData) => {
    // Implementar edición de producto
    console.log("Editar producto:", product);
    // TODO: Implementar llamada a la API para editar el producto
  };

  const handleDeleteProduct = (productId: string) => {
    if (!selectedProforma) return;

    const updatedProformas = proformas.map((p) => {
      if (p.id === selectedProforma.id) {
        return {
          ...p,
          products: p.products.filter((product) => product.id !== productId),
        };
      }
      return p;
    });

    // También aquí necesitas el casting
    setProformas(updatedProformas as AdaptedProformaData[]);

    // TODO: Implementar llamada a la API para eliminar el producto

    setSelectedProforma((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        products: prev.products.filter((product) => product.id !== productId),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mb-2"></div>
          <p>Cargando datos de la cotización...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-md p-4 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Error al cargar la cotización
          </h2>
          <p className="text-white">{error}</p>
          <Button
            className="mt-4 bg-red-800 hover:bg-red-700"
            onClick={() => router.push("/cotizaciones")}
          >
            Volver a cotizaciones
          </Button>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <div className="bg-gray-800 border border-gray-700 rounded-md p-4 max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">
            Cotización no encontrada
          </h2>
          <p className="text-gray-400">
            No se pudo encontrar la cotización solicitada.
          </p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/cotizaciones")}
          >
            Volver a cotizaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white">
      <Sidebar />
      <Navbar />

      {/* Main Content */}
      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-900 p-3 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
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
              <div>
                <h1 className="text-xl font-bold text-white">
                  {cotizacion.nombre}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {cotizacion.pais === "Bolivia" ? "🇧🇴" : "🇨🇱"}
                  </span>
                  <span className="text-sm text-gray-400">
                    Cotización {cotizacion.pais}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-gray-800 text-white border-gray-700"
              >
                <DropdownMenuItem className="hover:bg-gray-700">
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700">
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700">
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Total CBM */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-gray-800 rounded-lg w-fit">
            <Package className="h-5 w-5 text-gray-300" />
            <span className="font-semibold">Total {cotizacion.cbm} CBM</span>
          </div>

          {/* Estado de Aprobación */}
          <div className="flex items-center gap-2 mb-6">
            <Badge
              className={`${
                cotizacion.estadoAprobacion === "APROBADA"
                  ? "bg-green-900 text-green-400 border-green-800"
                  : cotizacion.estadoAprobacion === "RECHAZADA"
                  ? "bg-red-900 text-red-400 border-red-800"
                  : cotizacion.estadoAprobacion === "SOLICITADO"
                  ? "bg-yellow-900 text-yellow-400 border-yellow-800"
                  :"bg-yellow-900 text-yellow-400 border-yellow-800"
              }`}
            >
              {cotizacion.estadoAprobacion}
            </Badge>
            {proformaDetalle?.comentarioAprobacion && (
              <span className="text-sm text-gray-400">
                {proformaDetalle.comentarioAprobacion}
              </span>
            )}

            {/* Botón de Solicitar Aprobación - Solo mostrar si está PENDIENTE */}
            {cotizacion.estadoAprobacion === "PENDIENTE" && (
              <SolicitarAprobacionButton
                proformaId={cotizacion.id}
                onSuccess={() => {
                  if (cotizacion) {
                    setCotizacion({
                      ...cotizacion,
                      estadoAprobacion: "APROBADO",
                    });
                  }
                }}
              />
            )}

            {/* Botón de Verificar Estado de Documentos - Solo mostrar si está APROBADA */}
            {cotizacion.estadoAprobacion === "APROBADA" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                onClick={() => handleOpenDocumentsModal(cotizacion.id)}
              >
                Verificar Estado de Documentos
              </Button>
            )}
          </div>

          <ProformaDocumentsModal
            open={documentsModalOpen}
            onClose={() => setDocumentsModalOpen(false)}
            proformaId={selectedProformaId}
          />
          {/* Exchange Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border border-blue-900 rounded-lg p-3 flex justify-between items-center bg-gray-800">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Binance $us/Bs.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Bs. 16,25</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="border border-blue-900 rounded-lg p-3 flex justify-between items-center bg-gray-800">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Banco $us/Bs.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Bs. 6,96</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 mb-6">
            La tasa de divisa ha sido establecida
          </div>

          {/* Pricing Tiers */}
          <div className="flex justify-end mb-6">
            <div className="grid grid-cols-3 gap-2 w-full max-w-md">
              <div className="text-center p-2 border border-green-800 rounded-md bg-green-900 bg-opacity-20">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-semibold text-green-400">
                    $ {cotizacion.precioCBM}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-green-900 bg-opacity-30 text-green-400 text-xs h-5 border-green-800"
                  >
                    ✓
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">1 a 5 CBM</p>
              </div>
              <div className="text-center p-2 border border-gray-700 rounded-md bg-gray-800">
                <div className="font-semibold text-gray-300">
                  $ {Math.round(cotizacion.precioCBM * 0.95)}
                </div>
                <p className="text-xs text-gray-400 mt-1">5 a 10 CBM</p>
              </div>
              <div className="text-center p-2 border border-gray-700 rounded-md bg-gray-800">
                <div className="font-semibold text-gray-300">
                  $ {Math.round(cotizacion.precioCBM * 0.9)}
                </div>
                <p className="text-xs text-gray-400 mt-1">10+ CBM</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-between mb-6">
            <Button
              variant="outline"
              className="bg-blue-900 bg-opacity-20 text-blue-400 border-blue-900 hover:bg-blue-900 hover:bg-opacity-30"
              onClick={() => setProformaModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Proforma EXW
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-teal-900 bg-opacity-20 text-teal-400 border-teal-900 hover:bg-teal-900 hover:bg-opacity-30"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>

              <Button
                variant="outline"
                className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir PDF
              </Button>
            </div>
          </div>

          {/* Proformas List */}
          {proformas.length > 0 && (
            <div className="space-y-4">
              {proformas.map((proforma) => (
                <ProformaSummary
                  key={proforma.id}
                  proforma={proforma as ProformaData}
                  onOpenProductList={() =>
                    handleOpenProductList(proforma as ProformaData)
                  }
                  onEditProforma={() => {
                    // Implementar edición de proforma
                    console.log("Editar proforma:", proforma);
                  }}
                />
              ))}
            </div>
          )}

          {/* Modal de Proforma EXW */}
          <ProformaExwModal
            open={proformaModalOpen}
            onOpenChange={setProformaModalOpen}
            onSubmit={handleCreateProforma}
          />

          {/* Modal de Lista de Productos */}
          {selectedProforma && (
            <ProductListModal
              open={productListModalOpen}
              onOpenChange={setProductListModalOpen}
              proformaData={selectedProforma}
              products={selectedProforma.products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
        </div>
      </main>
    </div>
  );
}
