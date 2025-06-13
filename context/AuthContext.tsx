"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  getCurrentUser,
  logout as authLogout,
} from "@/services/auth";

// Interfaces
interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  nombreEmpresa: string;
  tipoUsuario: string;
}

// Contexto de autenticación
interface AuthContextType {
  isLoggedIn: boolean;
  usuario: Usuario | null;
  tipoUsuario: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Cargar autenticación y usuario desde localStorage
  const cargarDatosAuth = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);

    if (authenticated) {
      const user = getCurrentUser();
      setUsuario(user);
    } else {
      setUsuario(null);
    }
  };

  // Cierre de sesión
  const handleLogout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUsuario(null);
    router.push("/sign-in");
  };

  useEffect(() => {
    cargarDatosAuth();

    const handleStorageChange = () => {
      cargarDatosAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        usuario,
        tipoUsuario: usuario?.tipoUsuario ?? null,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
