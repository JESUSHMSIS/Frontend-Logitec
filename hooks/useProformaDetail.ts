import { useState, useEffect } from 'react';
import axios from 'axios';

// Tipos de datos
export type ProductoProforma = {
  id: string;
  descripcion: string;
  hsCode: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  totalCbm: number;
  imagen: string | null;
  exWorksId: string;
  tributoId: string;
};

export type ExWorkProforma = {
  id: string;
  proformaId: string;
  enlaceCompra: string;
  metodoPagoId: string;
  controlCalidad: boolean;
  costoEnvioAlmacen: number;
  gastosDespacho: number;
  gastosDesconsolidacion: number;
  otrosGastos: number;
  createdAt: string;
  productos: ProductoProforma[];
};

export type ProformaDetalle = {
  id: string;
  nombre: string;
  transporteId: string;
  destinoId: string;
  cbmTotal: number;
  precioCBM: number;
  createdAt: string;
  usuarioId: string;
  estadoAprobacion: string;
  comentarioAprobacion: string;
  exWorks: ExWorkProforma[];
  transporte?: {
    tipo: string;
  };
  destino?: {
    pais: string;
  };
};

// Tipo para los datos adaptados a la interfaz existente
export type AdaptedCotizacion = {
  id: string;
  nombre: string;
  pais: string;
  transporte: string;
  fecha: string;
  cbm: number;
  precioCBM: number;
  estadoAprobacion: string;
  exWorks: boolean;
};

export type AdaptedProformaData = {
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
  products: {
    id: string;
    description: string;
    hsCode: string;
    quantity: number;
    unitPrice: number;
    totalCBM: number;
    ga: number;
    iva: number;
    ice: number;
    image: string | null;
  }[];
};

export const useProformaDetail = (id: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proformaDetalle, setProformaDetalle] = useState<ProformaDetalle | null>(null);
  const [adaptedCotizacion, setAdaptedCotizacion] = useState<AdaptedCotizacion | null>(null);
  const [adaptedProformas, setAdaptedProformas] = useState<AdaptedProformaData[]>([]);

  useEffect(() => {
    const fetchProformaDetail = async () => {
      if (!id) {
        setError("ID de proforma no proporcionado");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // URL de la API - Asegúrate de que esta URL es correcta
        // Cambiamos la URL para que coincida con tu backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";
        
        console.log(`Obteniendo proforma con ID: ${id}`);
        console.log(`URL de la API: ${API_URL}/proformas/${id}`);
        
        // Obtener la proforma del backend
        // Nota: Eliminamos la verificación del token para simplificar
        const response = await axios.get(`${API_URL}/proformas/${id}`);
        
        console.log("Respuesta de la API:", response.data);
        
        if (response.data) {
          const proformaData = response.data;
          setProformaDetalle(proformaData);
          
          // Adaptar la respuesta al formato de Cotizacion
          const adapted: AdaptedCotizacion = {
            id: proformaData.id,
            nombre: proformaData.nombre || "Proforma sin nombre",
            pais: proformaData.destino?.pais || "No especificado",
            transporte: proformaData.transporte?.tipo?.toLowerCase() || "terrestre",
            fecha: new Date(proformaData.createdAt).toLocaleString("es", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            cbm: proformaData.cbmTotal || 0,
            precioCBM: proformaData.precioCBM || 0,
            estadoAprobacion: proformaData.estadoAprobacion || "PENDIENTE",
            exWorks: proformaData.exWorks && proformaData.exWorks.length > 0,
          };
          
          setAdaptedCotizacion(adapted);
          
          // Adaptar exWorks a formato de ProformaData
          if (proformaData.exWorks && proformaData.exWorks.length > 0) {
            const adaptedExWorks: AdaptedProformaData[] = proformaData.exWorks.map((exw: ExWorkProforma) => ({
              id: exw.id,
              comisionType: "alibaba", // Valor por defecto
              comisionValue: "2.99", // Valor por defecto
              qualityControl: exw.controlCalidad,
              shippingCost: exw.costoEnvioAlmacen.toString(),
              dispatchExpense: exw.gastosDespacho.toString(),
              deconsolidation: exw.gastosDesconsolidacion.toString(),
              otherExpenses: exw.otrosGastos.toString(),
              sumUsage: "0", // Valor por defecto
              link: exw.enlaceCompra || "https://www.alibaba.com/product-detail/example",
              createdAt: new Date(exw.createdAt).toLocaleString("es", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              products: exw.productos.map((prod) => ({
                id: prod.id,
                description: prod.descripcion,
                hsCode: prod.hsCode,
                quantity: prod.cantidad,
                unitPrice: prod.precioUnitario,
                totalCBM: prod.totalCbm,
                ga: 0, // Valores por defecto para tributos
                iva: 14.94,
                ice: 0,
                image: prod.imagen,
              })),
            }));
            
            setAdaptedProformas(adaptedExWorks);
          }
        } else {
          throw new Error(`No se encontró la proforma con ID: ${id}`);
        }
      } catch (err: any) {
        console.error("Error al obtener la proforma:", err);
        
        // Información detallada del error
        if (err.response) {
          console.error("Datos de respuesta de error:", err.response.data);
          console.error("Estado de respuesta de error:", err.response.status);
          
          if (err.response.status === 404) {
            setError(`Cotización no encontrada: ${id}. Verifica que el ID sea correcto.`);
          } else {
            setError(`Error del servidor: ${err.response.status}. ${err.response.data?.message || ''}`);
          }
        } else if (err.request) {
          console.error("No se recibió respuesta:", err.request);
          setError("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
        } else {
          console.error("Error al configurar la solicitud:", err.message);
          setError(`Error: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProformaDetail();
  }, [id]);

  return {
    isLoading,
    error,
    proformaDetalle,
    cotizacion: adaptedCotizacion,
    proformas: adaptedProformas,
  };
};
