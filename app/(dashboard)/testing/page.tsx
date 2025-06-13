"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function TestingPage() {
  const [email, setEmail] = useState("");
  const [testType, setTestType] = useState<'login' | 'failed-login'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/run-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "functional",
          email,
          testType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Pruebas ejecutadas correctamente");
        // Recargar la página después de 2 segundos
        setTimeout(() => {
          window.location.href = "/testing";
        }, 2000);
      } else {
        setError(data.error || "Error al ejecutar las pruebas");
      }
    } catch (error) {
      setError("Error al ejecutar las pruebas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Ejecutar Pruebas</CardTitle>
            <CardDescription>
              Ejecuta pruebas automatizadas y recibe reportes detallados en tu correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testType">Tipo de Prueba</Label>
                <Select
                  value={testType}
                  onValueChange={(value) => setTestType(value as 'login' | 'failed-login')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el tipo de prueba" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="login">Login Exitoso</SelectItem>
                    <SelectItem value="failed-login">Login Fallido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Ejecutando..." : "Ejecutar Pruebas"}
              </Button>
            </form>

            {message && (
              <Alert className="mt-6 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {message}
                  <p className="text-sm text-green-600 mt-1">La página se refrescará automáticamente...</p>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mt-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 