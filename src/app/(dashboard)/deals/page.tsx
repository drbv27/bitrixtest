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

export default function DealsPage() {
  // Usamos nuestro hook para obtener los datos, el estado de carga y de error
  const { data: dealsData, isLoading, isError, error } = useDeals();

  if (isLoading) {
    return <div className="p-8">Cargando deals...</div>;
  }

  if (isError) {
    return (
      <div className="p-8">Error al cargar los deals: {error.message}</div>
    );
  }

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
            {dealsData?.result?.map((deal: any) => (
              <TableRow key={deal.ID}>
                <TableCell>{deal.ID}</TableCell>
                <TableCell className="font-medium">{deal.TITLE}</TableCell>
                <TableCell>{deal.STAGE_ID}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-US").format(deal.OPPORTUNITY)}
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
