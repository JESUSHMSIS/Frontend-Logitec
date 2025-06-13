import { API_CONFIG } from "@/config/api";

// Interfaces para la autenticación
interface LoginCredentials {
  correo: string;
  password: string;
}

// Interfaz para el usuario
interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  nombreEmpresa: string;
  tipoUsuario: string;
}

// Interfaz para los permisos
interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  accion: string;
}

// Interfaz para la respuesta de login
interface LoginResponse {
  access_token: string;
  usuario: Usuario;
  permisos: Permiso[];
}

// Función para iniciar sesión
export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      // Si la respuesta no es exitosa, convertimos el error a un formato legible
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    // Devolvemos los datos de la respuesta
    return await response.json();
  } catch (error) {
    console.error("Error en la petición de login:", error);
    throw error;
  }
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("access_token");
  return !!token;
}

// Función para obtener el token
export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("access_token");
}

// Función para obtener el usuario actual
export function getCurrentUser(): Usuario | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("usuario");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error al parsear datos del usuario:", error);
    return null;
  }
}

// Función para obtener los permisos del usuario
export function getUserPermisos(): Permiso[] {
  if (typeof window === "undefined") return [];

  const permisosStr = localStorage.getItem("permisos");
  if (!permisosStr) return [];

  try {
    return JSON.parse(permisosStr);
  } catch (error) {
    console.error("Error al parsear permisos del usuario:", error);
    return [];
  }
}

// Función para verificar si el usuario tiene un permiso específico
export function hasPermiso(nombrePermiso: string): boolean {
  const permisos = getUserPermisos();
  return permisos.some((permiso) => permiso.nombre === nombrePermiso);
}

// Función para cerrar sesión
export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("permisos");

  // Redirigir al login
  window.location.href = "/sign-in";
}
