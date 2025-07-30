// src/hooks/useDeals.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DealsApiResponse } from "@/types/bitrix24"; // Importamos nuestro nuevo tipo

// Le decimos a Axios qué tipo de datos esperamos recibir
const fetchDeals = async (): Promise<DealsApiResponse> => {
  const { data } = await axios.get<DealsApiResponse>("/api/deals");
  return data;
};

export function useDeals() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: fetchDeals,
  });
}
