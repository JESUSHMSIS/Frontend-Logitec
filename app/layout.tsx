import type { Metadata } from 'next';
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Providers from "@/lib/providers/provider";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Logitec",
  description: "Sistema de gestión de Logitec",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <AuthProvider>
        <Providers>
          <body
            className={`${inter.className}__className_d65c78 bg-gray-900 text-white`}
          >
            <div>
              <Toaster position="top-right" richColors />
              {children}
            </div>
          </body>
        </Providers>
      </AuthProvider>
    </html>
  );
}
