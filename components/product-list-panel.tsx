"use client"
import { useState } from "react"
import { X, Package, Upload, Plus, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddProductModal, { type ProductData } from "./add-product-modal"
import ProductDetailView from "./product-detail-view"
import ExcelUploadModal from "./excel-upload-modal"

interface ProductListPanelProps {
  open: boolean
  onClose: () => void
  proformaData: {
    id: string
    comisionType: "alibaba" | "bancaria"
    comisionValue: string
    qualityControl: boolean | null
    shippingCost: string
    dispatchExpense: string
    deconsolidation: string
    otherExpenses: string
    sumUsage: string
  }
  products: ProductData[]
  onAddProduct: (product: ProductData) => void
  onAddMultipleProducts?: (products: ProductData[]) => void
}

export default function ProductListPanel({
  open,
  onClose,
  proformaData,
  products,
  onAddProduct,
  onAddMultipleProducts,
}: ProductListPanelProps) {
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [excelUploadModalOpen, setExcelUploadModalOpen] = useState(false)
  const exchangeRate = 6.96 // Tipo de cambio fijo para este ejemplo
  const cbmPrice = 215 // Precio por CBM

  if (!open) return null

  // Calculate totals
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalCBM = products.reduce((sum, product) => sum + product.totalCBM, 0)

  // Calcular totales generales
  const totalMerchandiseValue = products.reduce((sum, product) => sum + product.quantity * product.unitPrice, 0)
  const comisionRate = Number.parseFloat(proformaData.comisionValue) / 100
  const totalComision = totalMerchandiseValue * comisionRate
  const totalShippingCost = Number.parseFloat(proformaData.shippingCost)

  const totalImpuestos = products.reduce((sum, product) => {
    const merchandiseValue = product.quantity * product.unitPrice
    const gaValue = merchandiseValue * (product.ga / 100)
    const ivaValue = merchandiseValue * (product.iva / 100)
    const iceValue = merchandiseValue * (product.ice / 100)
    return sum + gaValue + ivaValue + iceValue
  }, 0)

  const totalDesaduanizacion = Number.parseFloat(proformaData.dispatchExpense)
  const totalGastos = totalMerchandiseValue + totalComision + totalShippingCost + totalImpuestos + totalDesaduanizacion
  const servicioWills = totalGastos * 0.03 // 3%
  const sumaTotal = totalGastos + servicioWills

  const handleSaveExcelProducts = (newProducts: ProductData[]) => {
    // Si hay una función para añadir múltiples productos, la usamos
    if (onAddMultipleProducts) {
      onAddMultipleProducts(newProducts)
    } else {
      // Si no, añadimos los productos uno por uno
      newProducts.forEach((product) => {
        onAddProduct(product)
      })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 border-t border-gray-700 shadow-lg transition-transform duration-300 transform translate-y-0 text-white max-h-[80vh] overflow-y-auto">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-300" />
            <div>
              <h2 className="text-lg font-semibold text-white">Proforma EXW</h2>
              <div className="flex items-center text-gray-400 text-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {totalUnits} Unid.
                <span className="mx-1">-</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {totalCBM.toFixed(2)} CBM a ({cbmPrice}$ x CBM)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <ChevronUp className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-8 gap-1 mb-4 text-xs">
          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${totalMerchandiseValue.toFixed(2)}</div>
            <div className="text-gray-400">{(totalMerchandiseValue * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Valor de Mercancía
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${totalComision.toFixed(2)}</div>
            <div className="text-gray-400">{(totalComision * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <path
                  d="M19 16V7M19 7H5M19 7L15 11M5 16V7M5 7L9 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Com. Alibaba {proformaData.comisionValue}%
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${totalShippingCost.toFixed(2)}</div>
            <div className="text-gray-400">{(totalShippingCost * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Costo de Envío
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${totalImpuestos.toFixed(2)}</div>
            <div className="text-gray-400">{(totalImpuestos * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Total Impuestos
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${totalDesaduanizacion.toFixed(2)}</div>
            <div className="text-gray-400">{(totalDesaduanizacion * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Total Desaduanización
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${totalGastos.toFixed(2)}</div>
            <div className="text-gray-400">{(totalGastos * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Total Gastos
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${servicioWills.toFixed(2)}</div>
            <div className="text-gray-400">{(servicioWills * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M15 9L9 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 9L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Total Serv. Wills 3%
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-20 p-2 rounded-md">
            <div className="text-blue-400 mb-1">$us/Bs. {exchangeRate.toFixed(2)}</div>
            <div className="text-white font-medium">${sumaTotal.toFixed(2)}</div>
            <div className="text-gray-400">{(sumaTotal * exchangeRate).toFixed(2)} Bs.</div>
            <div className="text-gray-500 mt-1 flex items-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Suma Total
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAddProductModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Prod.
          </Button>
          <Button
            variant="outline"
            className="bg-green-900 bg-opacity-20 text-green-400 border-green-800 hover:bg-green-900 hover:bg-opacity-30"
            onClick={() => setExcelUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Excel
          </Button>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No tienes productos registrados</div>
          ) : (
            products.map((product, index) => (
              <ProductDetailView
                key={product.id}
                product={product}
                proformaData={proformaData}
                exchangeRate={exchangeRate}
                cbmPrice={cbmPrice}
                index={index}
              />
            ))
          )}
        </div>

        {/* Add Product Modal */}
        <AddProductModal
          open={addProductModalOpen}
          onOpenChange={setAddProductModalOpen}
          onSave={onAddProduct}
          proformaId={proformaData.id}
        />

        {/* Excel Upload Modal */}
        <ExcelUploadModal
          open={excelUploadModalOpen}
          onOpenChange={setExcelUploadModalOpen}
          onSave={handleSaveExcelProducts}
          proformaId={proformaData.id}
        />
      </div>
    </div>
  )
}
