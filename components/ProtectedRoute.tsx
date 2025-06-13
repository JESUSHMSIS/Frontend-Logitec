"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermiso?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermiso,
}: ProtectedRouteProps) {
  const { isLoggedIn, hasPermiso } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    // Si se requiere un permiso específico y no lo tiene, redirigir a una página de acceso denegado
    if (requiredPermiso && !hasPermiso(requiredPermiso)) {
      router.push("/acceso-denegado");
    }
  }, [isLoggedIn, hasPermiso, requiredPermiso, router]);

  // Si está autenticado y tiene los permisos necesarios, mostrar el contenido
  if (isLoggedIn && (!requiredPermiso || hasPermiso(requiredPermiso))) {
    return <>{children}</>;
  }

  // Mientras se verifica la autenticación, mostrar un indicador de carga
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
