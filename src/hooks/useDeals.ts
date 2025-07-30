// src/hooks/useDeals.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Definimos una función para obtener los datos desde NUESTRO endpoint
const fetchDeals = async () => {
  const { data } = await axios.get("/api/deals");
  return data;
};

export function useDeals() {
  return useQuery({
    queryKey: ["deals"], // Una clave única para esta consulta
    queryFn: fetchDeals, // La función que se ejecutará para obtener los datos
  });
}
