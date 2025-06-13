import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Proforma } from "./useProformas";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api";

export const useAllProformas = () => {
  return useQuery({
    queryKey: ["proformas"],
    queryFn: async (): Promise<Proforma[]> => {
      const response = await axios.get(`${API_URL}/proformas`);
      return response.data;
    },
  });
};
