import axios from "axios";

// Configuración base de Axios
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
