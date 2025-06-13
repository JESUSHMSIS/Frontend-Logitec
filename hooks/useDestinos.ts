import { useQuery } from "@tanstack/react-query";
import { fetchDestinos } from "@/services/destinos";
import { Destino } from "./useProformas";

export function useDestinos() {
  return useQuery<Destino[], Error>({
    queryKey: ["destinos"],
    queryFn: fetchDestinos,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}