// src/lib/bitrix24-sync.ts
import Deal from "@/models/Deal";
import dbConnect from "./mongoose";
import { BitrixDeal } from "@/types/bitrix24";

const WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ===================================================================================
// FUNCIÓN #1: Para el CRON JOB AUTOMÁTICO (Usa Webhook)
// ===================================================================================
export async function syncDealsWithWebhook() {
  if (!WEBHOOK_URL) throw new Error("La URL del webhook no está configurada.");

  console.log("Iniciando sincronización automática con Webhook...");
  await dbConnect();

  let start = 0;
  const DEALS_PER_PAGE = 50;
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    const url = `${WEBHOOK_URL}crm.deal.list.json?start=${start}&select[]=*&select[]=UF_*`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Error en API: ${response.statusText}`);

    const data = (await response.json()) as { result: BitrixDeal[] };
    const dealsData = data.result || [];

    if (dealsData.length < DEALS_PER_PAGE) hasMore = false;

    if (dealsData.length > 0) {
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
      console.log(`[Webhook Sync] Página procesada. Total: ${totalProcessed}`);
    }
    start += DEALS_PER_PAGE;
    await delay(500);
  }
  console.log(
    `Sincronización automática completada! Total de deals: ${totalProcessed}`
  );
  return totalProcessed;
}

// ===================================================================================
// FUNCIÓN #2: Para el BOTÓN MANUAL (Usa Token de Sesión) - SIN CAMBIOS
// ===================================================================================
export async function syncAllDeals(accessToken: string, portalUrl: string) {
  console.log("Iniciando sincronización manual...");
  await dbConnect();

  let start = 0;
  const DEALS_PER_PAGE = 50;
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    const url = `${portalUrl}crm.deal.list.json?auth=${accessToken}&start=${start}&select[]=*&select[]=UF_*`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Error en API: ${response.statusText}`);

    const data = (await response.json()) as { result: BitrixDeal[] };
    const dealsData = data.result || [];

    if (dealsData.length < DEALS_PER_PAGE) hasMore = false;

    if (dealsData.length > 0) {
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
      console.log(`[Manual Sync] Página procesada. Total: ${totalProcessed}`);
    }
    start += DEALS_PER_PAGE;
    await delay(500);
  }
  console.log(
    `¡Sincronización manual completada! Total de deals: ${totalProcessed}`
  );
  return totalProcessed;
}
