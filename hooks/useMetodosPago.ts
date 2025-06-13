import { useQuery } from "@tanstack/react-query";
import { fetchMetodosPago, MetodoPago } from "@/services/metodosPago";

export function useMetodosPago() {
  return useQuery<MetodoPago[], Error>({
    queryKey: ["metodosPago"],
    queryFn: fetchMetodosPago,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
