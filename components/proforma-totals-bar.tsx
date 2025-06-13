"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { ProductData } from "./add-product-modal"

interface ProformaTotalsBarProps {
  proformaData: {
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
}

export default function ProformaTotalsBar({ proformaData, products }: ProformaTotalsBarProps) {
  const [expanded, setExpanded] = useState(false)
  const exchangeRate = 6.96 // Tipo de cambio fijo para este ejemplo

  // Calculate totals
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalCBM = products.reduce((sum, product) => sum + product.totalCBM, 0)
  const cbmPrice = 215 // Precio por CBM

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

  // Calcular prorrateo (asumiendo que es un porcentaje del total)
  const prorrateo = 59 // Porcentaje fijo para este ejemplo

  return (
    <div className="bg-gray-900 rounded-lg mb-4 text-white">
      {/* Units and CBM Summary */}
      <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-800">
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
          className="ml-auto mr-2 p-1 rounded-full bg-gray-800 hover:bg-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Totals Grid */}
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
    </div>
  )
}
