"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  FileText,
  Truck,
  Files,
  Component,
  Group,
  TestTube,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { GitPullRequest, GitPullRequestDraft } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { tipoUsuario } = useAuth();

  // Verificaciones de tipo de usuario
  const esAdminOGerente =
    tipoUsuario === "Admin" || tipoUsuario === "Gerente logistico";
  const esCliente = tipoUsuario === "Cliente";

  return (
    <div className="h-screen fixed left-0 top-0 z-40 bg-gray-900 text-white flex flex-col w-[60px] transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div className="flex items-center justify-center p-4 h-16 border-b border-gray-800">
        <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center overflow-hidden">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <TooltipProvider>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {/* Cotizar - cliente y otros */}
            {(esCliente || esAdminOGerente) && (
              <>
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/grupos"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/grupos" ? "bg-blue-900" : ""
                        }`}
                      >
                        <Component className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Grupos</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/cotizaciones"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/cotizaciones" ? "bg-blue-900" : ""
                        }`}
                      >
                        <Package className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Cotizar</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/tabla-proformas"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/tabla-proformas" ? "bg-blue-900" : ""
                        }`}
                      >
                        <FileText className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tabla de proformas</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              </>
            )}

            {/* Solo Admin y Gerente logístico */}
            {esAdminOGerente && (
              <>
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/tabla-general-proformas"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/tabla-general-proformas"
                            ? "bg-blue-900"
                            : ""
                        }`}
                      >
                        <Files className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tabla general de proformas</p>
                    </TooltipContent>
                  </Tooltip>
                </li>

                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/transportes"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/transportes" ? "bg-blue-900" : ""
                        }`}
                      >
                        <Truck className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Transportes</p>
                    </TooltipContent>
                  </Tooltip>
                </li>

                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/tabla-grupos"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/tabla-grupos" ? "bg-blue-900" : ""
                        }`}
                      >
                        <Group className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tabla general de grupos</p>
                    </TooltipContent>
                  </Tooltip>
                </li>

                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/solicitudes-grupo"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/solicitudes-grupo" ? "bg-blue-900" : ""
                        }`}
                      >
                        <GitPullRequestDraft className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Solicitudes de grupo</p>
                    </TooltipContent>
                  </Tooltip>
                </li>

                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/testing"
                        className={`flex items-center justify-center px-0 py-3 hover:bg-blue-900 ${
                          pathname === "/testing" ? "bg-blue-900" : ""
                        }`}
                      >
                        <TestTube className="h-5 w-5 min-w-[20px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Testing</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              </>
            )}
          </ul>
        </nav>
      </TooltipProvider>

      {/* Perfil siempre visible */}
      <TooltipProvider>
        <div className="p-4 border-t border-gray-800 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/perfil"
                className="flex items-center justify-center hover:bg-blue-900 p-2 rounded-md"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center min-w-[32px]">
                  <span className="text-sm font-medium">P</span>
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Perfil</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
