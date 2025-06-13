"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Plus, Upload } from "lucide-react"
import AddProductModal, { type ProductData } from "./add-product-modal"
import ProductDetailView from "./product-detail-view"
import ExcelUploadModal from "./excel-upload-modal"

interface ProductListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  onEditProduct: (product: ProductData) => void
  onDeleteProduct: (productId: string) => void
}

export default function ProductListModal({
  open,
  onOpenChange,
  proformaData,
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductListModalProps) {
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [excelUploadModalOpen, setExcelUploadModalOpen] = useState(false)
  const exchangeRate = 6.96 // Tipo de cambio fijo para este ejemplo
  const cbmPrice = 215 // Precio por CBM

  // Calculate totals
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalCBM = products.reduce((sum, product) => sum + product.totalCBM, 0)

  const handleSaveExcelProducts = (newProducts: ProductData[]) => {
    // Añadimos todos los productos, no solo el último
    onAddProduct(newProducts[0]) // Esto es solo para compatibilidad con versiones anteriores

    // Añadimos todos los productos
    newProducts.forEach((product) => {
      onAddProduct(product)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto bg-gray-900 text-white p-0 border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div>
              <DialogTitle className="text-xl font-bold text-white">Lista de Productos</DialogTitle>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
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
        </div>

        {/* Add Product Modal */}
        <AddProductModal
          open={addProductModalOpen}
          onOpenChange={setAddProductModalOpen}
          onSave={onAddProduct}
          proformaId={proformaData.id}
          exWorkId={proformaData.id} // Pasamos el ID de la proforma como exWorkId
        />

        {/* Excel Upload Modal */}
        <ExcelUploadModal
          open={excelUploadModalOpen}
          onOpenChange={setExcelUploadModalOpen}
          onSave={handleSaveExcelProducts}
          proformaId={proformaData.id}
        />
      </DialogContent>
    </Dialog>
  )
}
