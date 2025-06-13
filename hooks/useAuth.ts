import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Necesitarás instalar esta dependencia
import axios from "axios";
import { API_CONFIG } from "@/config/api";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Guardar el token en una cookie
      Cookies.set("access_token", data.access_token, {
        expires: 1, // 1 día
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // También guardar en localStorage para acceso desde el cliente
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("permisos", JSON.stringify(data.permisos));

      // Pequeño retraso antes de redirigir para asegurar que los datos se guarden
      setTimeout(() => {
        // Redirigir al usuario al dashboard
        router.push("/cotizaciones");
      }, 100);
    },
    onError: (error) => {
      console.error("Error al iniciar sesión:", error);
    },
  });
}

// Interfaz para los datos de registro
export interface RegisterData {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  nombreEmpresa: string;
  ci: string;
}

// Función para registrar usuario
async function registerUser(data: RegisterData) {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
      data
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Error al registrar usuario");
  }
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // Redirigir al login después del registro exitoso
      router.push("/sign-in");
    },
    onError: (error: Error) => {
      console.error("Error al registrar:", error);
      throw error;
    },
  });
}