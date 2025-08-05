// src/app/(dashboard)/deals/page.tsx
"use client";

import { useState } from "react";
import { useDeals } from "@/hooks/useDeals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BitrixDeal } from "@/types/bitrix24";
import { Button } from "@/components/ui/button"; // Importamos el componente Button de ShadCN

export default function DealsPage() {
  const { data, isLoading, isError, error } = useDeals();
  const [syncStatus, setSyncStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("Sincronizando, por favor espera...");
    try {
      const response = await fetch("/api/manual-sync", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setSyncStatus("¡Sincronización completada con éxito!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setSyncStatus(`Error en la sincronización: ${message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <div className="p-8">Cargando deals...</div>;
  if (isError)
    return (
      <div className="p-8">Error al cargar los deals: {error.message}</div>
    );

  const deals: BitrixDeal[] = data?.result || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Deals del CRM</h1>
        <div>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Sincronizando..." : "Sincronizar Todos los Deals"}
          </Button>
        </div>
      </div>
      {syncStatus && (
        <p className="mb-4 text-center text-sm text-gray-600">{syncStatus}</p>
      )}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Etapa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.ID}>
                <TableCell>{deal.ID}</TableCell>
                <TableCell className="font-medium">{deal.TITLE}</TableCell>
                <TableCell>{deal.STAGE_ID}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
