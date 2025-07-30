// src/app/(dashboard)/deals/page.tsx
"use client";

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

export default function DealsPage() {
  const { data, isLoading, isError, error } = useDeals();

  if (isLoading) {
    return <div className="p-8">Cargando deals...</div>;
  }

  if (isError) {
    return (
      <div className="p-8">Error al cargar los deals: {error.message}</div>
    );
  }

  // Ahora 'data' está correctamente tipado gracias al hook
  const deals: BitrixDeal[] = data?.result || [];

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Deals del CRM</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Moneda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.ID}>
                <TableCell>{deal.ID}</TableCell>
                <TableCell className="font-medium">{deal.TITLE}</TableCell>
                <TableCell>{deal.STAGE_ID}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-US").format(
                    Number(deal.OPPORTUNITY)
                  )}
                </TableCell>
                <TableCell>{deal.CURRENCY_ID}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
