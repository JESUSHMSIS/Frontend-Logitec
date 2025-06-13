"use client";
import Cookies from "js-cookie"; // Importa la librería js-cookie para manejar cookies en el navegador
import { useState, useEffect } from "react";
import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  nombreEmpresa: string;
  tipoUsuario: string;
}

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [inicial, setInicial] = useState("U");
  const router = useRouter();

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      try {
        const usuarioParsed = JSON.parse(usuarioData) as Usuario;
        setUsuario(usuarioParsed);

        // Establecer la inicial del nombre
        if (usuarioParsed.nombre && usuarioParsed.nombre.length > 0) {
          setInicial(usuarioParsed.nombre.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Error al parsear datos del usuario:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Eliminar datos de autenticación del localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("permisos");

    // Eliminar la cookie de acceso
    Cookies.remove("access_token", { path: "/" });

    // Redirigir al login
    router.replace("/sign-in");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-gray-900 text-white h-16 flex items-center px-4 ml-[70px] border-b border-gray-800">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full text-xs flex items-center justify-center">
              1
            </span>
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="font-medium">
              {usuario?.nombre || "Usuario"} {usuario?.apellido || ""}
            </div>
            <div className="text-xs text-gray-400">
              {usuario?.correo || "correo@ejemplo.com"}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10 bg-amber-800"
              >
                <span className="text-lg font-medium">{inicial}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-gray-800 border-gray-700 text-white"
            >
              <DropdownMenuItem className="hover:bg-gray-700">
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                Configuración
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 text-red-400 flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
