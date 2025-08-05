// src/lib/bitrix24-sync.ts
import Deal from "@/models/Deal";
import dbConnect from "./mongoose";
import { BitrixDeal } from "@/types/bitrix24";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncAllDeals(accessToken: string, portalUrl: string) {
  console.log("Iniciando sincronización robusta (página por página)...");
  await dbConnect();

  let start = 0;
  const DEALS_PER_PAGE = 50;
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    // 1. Pedimos la siguiente página de deals
    const url = `${portalUrl}crm.deal.list.json?auth=${accessToken}&start=${start}&select[]=*&select[]=UF_*`;
    console.log(`Pidiendo deals desde el índice: ${start}`);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Error en la API de Bitrix24: ${response.statusText}`);
    }

    const data = (await response.json()) as { result: BitrixDeal[] };
    const dealsData = data.result || [];

    // 2. Si la página está vacía o tiene menos de 50, es la última.
    if (dealsData.length < DEALS_PER_PAGE) {
      hasMore = false;
    }

    if (dealsData.length > 0) {
      // 3. Preparamos y guardamos los deals de esta página
      const operations = dealsData.map((deal: BitrixDeal) => ({
        updateOne: {
          filter: { _id: deal.ID },
          update: {
            $set: {
              title: deal.TITLE,
              opportunity: deal.OPPORTUNITY,
              stageId: deal.STAGE_ID,
              lastUpdatedInB24: deal.DATE_MODIFY,
              syncedAt: new Date(),
              customFields: Object.fromEntries(
                Object.entries(deal).filter(([key]) =>
                  key.startsWith("UF_CRM_")
                )
              ),
            },
          },
          upsert: true,
        },
      }));

      await Deal.bulkWrite(operations);
      totalProcessed += operations.length;
      console.log(
        `Página procesada. ${operations.length} deals guardados/actualizados. Total hasta ahora: ${totalProcessed}`
      );
    }

    // 4. Pasamos a la siguiente página y esperamos para no saturar la API
    start += DEALS_PER_PAGE;
    await delay(500);
  }

  console.log(
    `¡Sincronización completada! Total de deals procesados: ${totalProcessed}`
  );
}
