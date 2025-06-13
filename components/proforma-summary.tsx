"use client"

import { useState } from "react"
import { FileText, MoreVertical, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ProductData } from "./add-product-modal"
import ProductDetailView from "./product-detail-view"

interface ProformaSummaryProps {
  proforma: {
    id: string
    comisionType: "alibaba" | "bancaria"
    comisionValue: string
    qualityControl: boolean | null
    shippingCost: string
    dispatchExpense: string
    deconsolidation: string
    otherExpenses: string
    sumUsage: string
    link: string
    createdAt: string
    products: ProductData[]
  }
  onOpenProductList: () => void
  onEditProforma: () => void
}

export default function ProformaSummary({ proforma, onOpenProductList, onEditProforma }: ProformaSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate totals
  const totalUnits = proforma.products.reduce((sum, product) => sum + product.quantity, 0)
  const totalCBM = proforma.products.reduce((sum, product) => sum + product.totalCBM, 0)
  const cbmPrice = 215 // Precio por CBM
  const exchangeRate = 6.96 // Tipo de cambio fijo para este ejemplo

  // Calcular totales generales
  const totalMerchandiseValue = proforma.products.reduce(
    (sum, product) => sum + product.quantity * product.unitPrice,
    0,
  )
  const comisionRate = Number.parseFloat(proforma.comisionValue) / 100
  const totalComision = totalMerchandiseValue * comisionRate
  const totalShippingCost = Number.parseFloat(proforma.shippingCost)

  const totalImpuestos = proforma.products.reduce((sum, product) => {
    const merchandiseValue = product.quantity * product.unitPrice
    const gaValue = merchandiseValue * (product.ga / 100)
    const ivaValue = merchandiseValue * (product.iva / 100)
    const iceValue = merchandiseValue * (product.ice / 100)
    return sum + gaValue + ivaValue + iceValue
  }, 0)

  const totalDesaduanizacion = Number.parseFloat(proforma.dispatchExpense)
  const totalGastos = totalMerchandiseValue + totalComision + totalShippingCost + totalImpuestos + totalDesaduanizacion
  const servicioWills = totalGastos * 0.03 // 3%
  const sumaTotal = totalGastos + servicioWills

  // Calcular prorrateo (asumiendo que es un porcentaje del total)
  const prorrateo = 59 // Porcentaje fijo para este ejemplo

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-sm p-4 mb-6 text-white">
      {/* Proforma Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gray-800 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Proforma EXW</h3>
            <div className="text-sm text-gray-400 truncate max-w-xs">{proforma.link}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem onClick={onEditProforma} className="hover:bg-gray-700">
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700">Duplicar</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700">Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Units and CBM Summary */}
      <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-800 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>{totalUnits} Unid.</span>
        <span>-</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>
          {totalCBM.toFixed(2)} CBM a ({cbmPrice}$ x CBM)
        </span>
        <button
          className="ml-auto p-1 rounded-full bg-gray-800 hover:bg-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Totals Summary Bar */}
      <div className="grid grid-cols-8 gap-1 p-2 text-xs">
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
            Com. Alibaba {proforma.comisionValue}%
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
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* Prorrateo indicator */}
      <div className="text-right text-xs text-gray-400 pr-2 pb-1">Prorrateo {prorrateo}%</div>

      {/* Product Details */}
      {expanded && proforma.products.length > 0 && (
        <div className="mt-4">
          {proforma.products.map((product, index) => (
            <ProductDetailView
              key={product.id}
              product={product}
              proformaData={proforma}
              exchangeRate={exchangeRate}
              cbmPrice={cbmPrice}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button
          variant="outline"
          className="w-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          onClick={onEditProforma}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Editar Proforma
        </Button>
        <Button
          variant="outline"
          className="w-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          onClick={onOpenProductList}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Lista Productos
        </Button>
      </div>
    </div>
  )
}
