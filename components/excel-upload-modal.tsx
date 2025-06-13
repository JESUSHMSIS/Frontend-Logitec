"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Upload, Download, Save, FileSpreadsheet, Plus, Trash2, Edit, FileText, Loader2, Info } from "lucide-react"
import * as XLSX from "xlsx"
import type { ProductData } from "./add-product-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExcelUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (products: ProductData[]) => void
  proformaId: string
}

type ExcelRow = {
  id: string
  description: string
  hsCode: string
  quantity: number | string
  unitPrice: number | string
  totalCBM: number | string
  ga: number | string
  iva: number | string
  ice: number | string
}

export default function ExcelUploadModal({ open, onOpenChange, onSave, proformaId }: ExcelUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "upload" | "pdf">("editor")
  const [excelData, setExcelData] = useState<ExcelRow[]>([
    { id: "1", description: "", hsCode: "", quantity: "", unitPrice: "", totalCBM: "", ga: 0, iva: 14.94, ice: 0 },
  ])
  const [fileName, setFileName] = useState<string>("")
  const [pdfFileName, setPdfFileName] = useState<string>("")
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Función para añadir una fila vacía al editor
  const addRow = () => {
    setExcelData([
      ...excelData,
      {
        id: Date.now().toString(),
        description: "",
        hsCode: "",
        quantity: "",
        unitPrice: "",
        totalCBM: "",
        ga: 0,
        iva: 14.94,
        ice: 0,
      },
    ])
  }

  // Función para eliminar una fila del editor
  const removeRow = (id: string) => {
    if (excelData.length > 1) {
      setExcelData(excelData.filter((row) => row.id !== id))
    }
  }

  // Función para actualizar los datos de una celda
  const updateCell = (id: string, field: keyof ExcelRow, value: string) => {
    setExcelData(
      excelData.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value }
        }
        return row
      }),
    )
  }

  // Función para manejar la carga de un archivo Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (evt) => {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json<ExcelRow>(ws)

        // Asegurarse de que cada fila tenga un ID único
        const processedData = data.map((row) => ({
          ...row,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          ga: row.ga || 0,
          iva: row.iva || 14.94,
          ice: row.ice || 0,
        }))

        if (processedData.length > 0) {
          setExcelData(processedData)
        }
      }
      reader.readAsBinaryString(file)
    }
  }

  // Función para manejar la carga de un archivo PDF
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFileName(file.name)
      setIsProcessingPdf(true)
      setProcessingProgress(0)

      // Simulación del procesamiento del PDF
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsProcessingPdf(false)
              // Datos simulados extraídos del PDF
              const extractedData: ExcelRow[] = [
                {
                  id: "pdf1",
                  description: "Galvanized C-shaped steel",
                  hsCode: "7211190000",
                  quantity: 50,
                  unitPrice: 0.551,
                  totalCBM: 0.25,
                  ga: 0,
                  iva: 14.94,
                  ice: 0,
                },
                {
                  id: "pdf2",
                  description: "Galvanized C-shaped steel",
                  hsCode: "7222110000",
                  quantity: 50,
                  unitPrice: 0.551,
                  totalCBM: 0.45,
                  ga: 0,
                  iva: 14.94,
                  ice: 0,
                },
                {
                  id: "pdf3",
                  description: "Carbon steel square tube",
                  hsCode: "7217678200",
                  quantity: 50,
                  unitPrice: 0.572,
                  totalCBM: 0.42,
                  ga: 0,
                  iva: 14.94,
                  ice: 0,
                },
              ]
              setExcelData(extractedData)
              setActiveTab("editor")
            }, 500)
          }
          return newProgress
        })
      }, 300)
    }
  }

  // Función para descargar la plantilla de Excel
  const downloadTemplate = () => {
    const template = [
      {
        Descripción: "",
        "HS Code": "",
        Cantidad: "",
        "Precio Unit.": "",
        "Total CBM": "",
        "GA%": 0,
        "IVA%": 14.94,
        "ICE%": 0,
      },
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Productos")
    XLSX.writeFile(wb, "plantilla_productos.xlsx")
  }

  // Función para guardar los productos
  const handleSave = () => {
    // Validar que todas las filas tengan los campos requeridos
    const isValid = excelData.every(
      (row) => row.description && row.hsCode && row.quantity && row.unitPrice && row.totalCBM,
    )

    if (!isValid) {
      alert("Por favor, complete todos los campos requeridos en todas las filas.")
      return
    }

    // Convertir los datos del Excel a ProductData
    const products: ProductData[] = excelData.map((row) => ({
      id: row.id,
      description: row.description,
      hsCode: row.hsCode,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unitPrice),
      totalCBM: Number(row.totalCBM),
      ga: Number(row.ga),
      iva: Number(row.iva),
      ice: Number(row.ice),
    }))

    // Guardar todos los productos, no solo el último
    onSave(products)
    onOpenChange(false)

    // Resetear el estado
    setExcelData([
      { id: "1", description: "", hsCode: "", quantity: "", unitPrice: "", totalCBM: "", ga: 0, iva: 14.94, ice: 0 },
    ])
    setFileName("")
    setPdfFileName("")
    setIsProcessingPdf(false)
    setProcessingProgress(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white p-0 border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <DialogTitle className="text-xl font-bold text-white">Subir Archivo Excel</DialogTitle>
            <p className="text-sm text-gray-400">Registra los productos mediante un excel</p>
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

        {/* Tabs */}
        <Tabs defaultValue="editor" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full border-b border-gray-700 rounded-none bg-gray-900">
            <TabsTrigger
              value="editor"
              className="data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editor de Excel
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Excel
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Escanear PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="p-4">
            <div className="mb-4">
              <Button onClick={addRow} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Fila
              </Button>
            </div>

            <div className="overflow-x-auto" ref={tableRef} style={{ maxWidth: "100%" }}>
              <div style={{ minWidth: "1200px" }}>
                <Table className="border-collapse">
                  <TableHeader className="bg-gray-800">
                    <TableRow>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-10">#</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[250px]">Descripción</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[150px]">HS Code</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[100px]">Cantidad</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[120px]">Precio Unit.</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[120px]">Total CBM</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[80px]">GA%</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[80px]">IVA%</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[80px]">ICE%</TableHead>
                      <TableHead className="text-gray-300 border-b border-gray-700 w-[80px]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.map((row, index) => (
                      <TableRow key={row.id} className="border-b border-gray-700">
                        <TableCell className="text-gray-300">{index + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={row.description}
                            onChange={(e) => updateCell(row.id, "description", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="Descripción"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.hsCode}
                            onChange={(e) => updateCell(row.id, "hsCode", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="HS Code"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateCell(row.id, "quantity", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="Cantidad"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.unitPrice}
                            onChange={(e) => updateCell(row.id, "unitPrice", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="Precio"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.totalCBM}
                            onChange={(e) => updateCell(row.id, "totalCBM", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="CBM"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.ga}
                            onChange={(e) => updateCell(row.id, "ga", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="GA%"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.iva}
                            onChange={(e) => updateCell(row.id, "iva", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="IVA%"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={row.ice}
                            onChange={(e) => updateCell(row.id, "ice", e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white h-8 w-full"
                            placeholder="ICE%"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(row.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                            disabled={excelData.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="p-4">
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-700 rounded-md bg-gray-800 mb-4">
              <FileSpreadsheet className="h-12 w-12 text-gray-500 mb-4" />

              {fileName ? (
                <div className="text-center">
                  <div className="bg-green-900 bg-opacity-20 text-green-400 border border-green-800 rounded-md p-3 mb-3">
                    <span className="font-medium">{fileName}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-blue-900 bg-opacity-20 text-blue-400 border-blue-800 hover:bg-blue-900 hover:bg-opacity-30"
                    onClick={() => {
                      setFileName("")
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">
                    Arrastra y suelta tu archivo Excel aquí o haz clic para seleccionarlo
                  </p>
                  <Button
                    variant="outline"
                    className="bg-blue-900 bg-opacity-20 text-blue-400 border-blue-800 hover:bg-blue-900 hover:bg-opacity-30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir archivo excel
                  </Button>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>

            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                Para subir un archivo Excel, asegúrate de seguir el formato indicado.
              </p>
              <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1" />
                Descarga este ejemplo
              </Button>
              <span className="text-gray-400 ml-1">para editarlo fácilmente.</span>
            </div>

            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader className="bg-gray-800">
                  <TableRow>
                    <TableHead className="text-gray-300 border-b border-gray-700 w-10">#</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">Descripción</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">HS Code</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">Cantidad</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">Precio Unit.</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">Total CBM</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">GA%</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">IVA%</TableHead>
                    <TableHead className="text-gray-300 border-b border-gray-700">ICE%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(8)].map((_, index) => (
                    <TableRow key={index} className="border-b border-gray-700">
                      <TableCell className="text-gray-300">{index + 1}</TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                      <TableCell className="text-gray-500"></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-yellow-500 text-sm mt-4">
              <span className="inline-block mr-1">⚠️</span>
              Se recomienda revisar los datos antes de guardar el archivo.
            </p>
          </TabsContent>

          <TabsContent value="pdf" className="p-4">
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-700 rounded-md bg-gray-800 mb-4">
              <FileText className="h-12 w-12 text-gray-500 mb-4" />

              {isProcessingPdf ? (
                <div className="text-center w-full">
                  <p className="text-gray-300 mb-3">Escaneando y procesando PDF...</p>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${processingProgress}%` }}></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400 mr-2" />
                    <span className="text-blue-400">
                      {processingProgress < 100 ? "Extrayendo datos..." : "Finalizando..."}
                    </span>
                  </div>
                </div>
              ) : pdfFileName ? (
                <div className="text-center">
                  <div className="bg-green-900 bg-opacity-20 text-green-400 border border-green-800 rounded-md p-3 mb-3">
                    <span className="font-medium">{pdfFileName}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-blue-900 bg-opacity-20 text-blue-400 border-blue-800 hover:bg-blue-900 hover:bg-opacity-30"
                    onClick={() => {
                      setPdfFileName("")
                      if (pdfInputRef.current) {
                        pdfInputRef.current.value = ""
                      }
                    }}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">
                    Sube un PDF con datos de productos para extraer automáticamente la información
                  </p>
                  <Button
                    variant="outline"
                    className="bg-blue-900 bg-opacity-20 text-blue-400 border-blue-800 hover:bg-blue-900 hover:bg-opacity-30"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Subir archivo PDF
                  </Button>
                </>
              )}

              <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfUpload} />
            </div>

            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                El sistema escaneará el PDF y extraerá automáticamente los datos de productos.
              </p>
              <p className="text-gray-400">Formatos soportados: Facturas, Listas de empaque, Documentos de embarque.</p>
            </div>

            <div className="bg-blue-900 bg-opacity-10 border border-blue-800 rounded-md p-4 text-sm">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Información sobre el escaneo de PDF
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>El sistema utiliza OCR (Reconocimiento Óptico de Caracteres) para extraer texto del PDF</li>
                <li>Los datos extraídos se cargarán automáticamente en el editor de Excel para su revisión</li>
                <li>Revisa siempre los datos extraídos antes de guardar, ya que pueden requerir ajustes</li>
                <li>Para mejores resultados, utiliza PDFs con texto seleccionable y no imágenes escaneadas</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

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
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isProcessingPdf}
          >
            <Save className="h-4 w-4 mr-2" />
            {activeTab === "editor" ? "Guardar Productos" : "Guardar Excel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
