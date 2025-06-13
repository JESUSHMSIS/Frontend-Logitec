"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ProductData } from "./add-product-modal"

interface ProductDetailViewProps {
  product: ProductData
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
  exchangeRate: number
  cbmPrice: number
  index: number
}

export default function ProductDetailView({
  product,
  proformaData,
  exchangeRate,
  cbmPrice,
  index,
}: ProductDetailViewProps) {
  const [expanded, setExpanded] = useState(false)

  // Cálculos
  const comisionRate = Number.parseFloat(proformaData.comisionValue) / 100
  const gaRate = product.ga / 100
  const ivaRate = product.iva / 100
  const iceRate = product.ice / 100
  const willsServiceRate = 0.03 // 3%

  // Valores de mercancía
  const merchandiseValue = product.quantity * product.unitPrice
  const merchandiseValueBs = merchandiseValue * exchangeRate

  // Comisión Alibaba
  const comisionValue = merchandiseValue * comisionRate
  const comisionValueBs = comisionValue * exchangeRate

  // Costo de envío (proporcional al CBM)
  const totalCBMInProforma = product.totalCBM
  const shippingCostPerCBM = Number.parseFloat(proformaData.shippingCost) / totalCBMInProforma
  const shippingCost = shippingCostPerCBM * product.totalCBM
  const shippingCostBs = shippingCost * exchangeRate

  // Impuestos
  const gaValue = merchandiseValue * gaRate
  const ivaValue = merchandiseValue * ivaRate
  const iceValue = merchandiseValue * iceRate
  const totalTaxes = gaValue + ivaValue + iceValue
  const totalTaxesBs = totalTaxes * exchangeRate

  // Desaduanización
  const dispatchExpensePerProduct = Number.parseFloat(proformaData.dispatchExpense) / 2 // Asumiendo que se divide entre los productos
  const desaduanizacionTotal = dispatchExpensePerProduct
  const desaduanizacionTotalBs = desaduanizacionTotal * exchangeRate

  // Totales
  const totalGastos = merchandiseValue + comisionValue + shippingCost + totalTaxes + desaduanizacionTotal
  const totalGastosBs = totalGastos * exchangeRate

  // Servicio Wills
  const servicioWills = totalGastos * willsServiceRate
  const servicioWillsBs = servicioWills * exchangeRate

  // Suma total
  const sumaTotal = totalGastos + servicioWills
  const sumaTotalBs = sumaTotal * exchangeRate

  // Valor CIF
  const valorCIF = merchandiseValue + comisionValue + shippingCost
  const valorCIFBs = valorCIF * exchangeRate

  return (
    <div className={`border-t border-gray-700 pt-4 ${index > 0 ? "mt-4" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Imagen y detalles básicos */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden mb-2">
            {product.image ? (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.description}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <span className="text-gray-400 text-xs">Sin imagen</span>
              </div>
            )}
          </div>
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md w-full text-center">
            ${(product.unitPrice || 0).toFixed(2)}
          </div>
        </div>

        {/* Información del producto */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-medium">{product.description}</h3>
              <div className="text-gray-400 text-xs flex items-center gap-1">
                <span>HS CODE: {product.hsCode}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-gray-300 text-sm">
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
                  {product.quantity} unidades
                </div>
                <span className="text-gray-500">|</span>
                <div className="flex items-center text-gray-300 text-sm">
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
                  {product.totalCBM.toFixed(2)} CBM
                </div>
              </div>
            </div>

            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white transition-colors">
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* Precio unitario */}
          <div className="mt-2 bg-green-900 bg-opacity-30 rounded-md p-2 inline-flex items-center">
            <div className="text-green-400 font-medium mr-1">Precio Unit.</div>
            <div className="text-white font-bold">${product.unitPrice.toFixed(2)}</div>
            <div className="text-gray-400 text-xs ml-1">Bs. {(product.unitPrice * exchangeRate).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Detalles expandibles */}
      {expanded && (
        <div className="mt-4 text-sm">
          {/* Secciones de cálculos */}
          <div className="grid grid-cols-3 gap-4">
            {/* GASTOS DE ORIGEN */}
            <div>
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-400 uppercase text-xs">GASTOS DE ORIGEN</h4>
                  <span className="text-xs bg-blue-900 bg-opacity-30 text-blue-400 px-1 rounded">
                    $us/Bs. {exchangeRate.toFixed(2)}
                  </span>
                </div>

                {/* Val. de Mercancía */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
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
                      <span className="text-gray-300">Val. de Mercancía</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-medium">${merchandiseValue.toFixed(2)}</span>
                      <button className="ml-2 text-gray-400">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-gray-500 text-xs">{merchandiseValueBs.toFixed(2)} Bs.</div>
                </div>

                {/* Com. Alibaba */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                      >
                        <path
                          d="M19 16V7M19 7H5M19 7L15 11M5 16V7M5 7L9 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-gray-300">Com. Alibaba {proformaData.comisionValue}%</span>
                    </div>
                    <span className="text-white font-medium">${comisionValue.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-gray-500 text-xs">{comisionValueBs.toFixed(2)} Bs.</div>
                </div>

                {/* Costo de Envío */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span className="text-gray-300">Costo de Envío ({product.totalCBM.toFixed(2)}CBM)</span>
                    </div>
                    <span className="text-white font-medium">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-gray-500 text-xs">{shippingCostBs.toFixed(2)} Bs.</div>
                </div>
              </div>
            </div>

            {/* CALCULO TRIBUTOS */}
            <div>
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-400 uppercase text-xs">CALCULO TRIBUTOS</h4>
                  <span className="text-xs bg-blue-900 bg-opacity-30 text-blue-400 px-1 rounded">
                    $us/Bs. {exchangeRate.toFixed(2)}
                  </span>
                </div>

                {/* Total Impuestos */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span className="text-gray-300">Total Impuestos</span>
                    </div>
                    <span className="text-white font-medium">${totalTaxes.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-gray-500 text-xs">{totalTaxesBs.toFixed(2)} Bs.</div>
                </div>

                {/* Desglose de impuestos */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-gray-800 p-2 rounded-md">
                    <div className="text-white font-medium">${gaValue.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">GA {product.ga}%</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-md">
                    <div className="text-white font-medium">${ivaValue.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">IVA {product.iva}%</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-md">
                    <div className="text-white font-medium">${iceValue.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">ICE {product.ice}%</div>
                  </div>
                </div>

                {/* Valor CIF */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
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
                      <span className="text-gray-300">Valor CIF</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-medium">${valorCIF.toFixed(2)}</span>
                      <button className="ml-2 text-gray-400">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-gray-500 text-xs">{valorCIFBs.toFixed(2)} Bs.</div>
                </div>
              </div>
            </div>

            {/* DESADUANIZACIÓN */}
            <div>
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-400 uppercase text-xs">DESADUANIZACIÓN</h4>
                  <span className="text-xs bg-blue-900 bg-opacity-30 text-blue-400 px-1 rounded">
                    $us/Bs. {exchangeRate.toFixed(2)}
                  </span>
                </div>

                {/* Total Desaduanización */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span className="text-gray-300">Total Desaduanización</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-medium">${desaduanizacionTotal.toFixed(2)}</span>
                      <button className="ml-2 text-gray-400">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-gray-500 text-xs">{desaduanizacionTotalBs.toFixed(2)} Bs.</div>
                </div>

                {/* TOTALES */}
                <div className="mt-4">
                  <h4 className="text-gray-400 uppercase text-xs text-center mb-2">TOTALES</h4>

                  {/* Total Gastos */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-400"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-gray-300">Total Gastos</span>
                      </div>
                      <span className="text-white font-medium">${totalGastos.toFixed(2)}</span>
                    </div>
                    <div className="text-right text-gray-500 text-xs">{totalGastosBs.toFixed(2)} Bs.</div>
                  </div>

                  {/* Servicio Wills */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-400"
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
                        <span className="text-gray-300">Servicio Wills 3%</span>
                      </div>
                      <span className="text-white font-medium">${servicioWills.toFixed(2)}</span>
                    </div>
                    <div className="text-right text-gray-500 text-xs">{servicioWillsBs.toFixed(2)} Bs.</div>
                  </div>

                  {/* Suma Total */}
                  <div className="mt-2 bg-blue-900 bg-opacity-30 p-2 rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-blue-400"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-blue-400">Suma Total</span>
                      </div>
                      <span className="text-white font-medium">${sumaTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-right text-blue-300 text-xs">{sumaTotalBs.toFixed(2)} Bs.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
