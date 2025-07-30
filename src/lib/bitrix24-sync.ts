// src/lib/bitrix24-sync.ts
import Deal from "@/models/Deal";
import dbConnect from "./mongoose";
import axios from "axios"; // Importamos axios

const WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncAllDeals() {
  if (!WEBHOOK_URL) {
    throw new Error(
      "La URL del webhook de Bitrix24 no está configurada en .env.local"
    );
  }
  console.log("Iniciando sincronización con Webhook usando AXIOS...");
  await dbConnect();

  const BATCH_SIZE = 50;
  const DEALS_PER_CALL = 50;
  let total = 0;

  // 1. Obtener el total de deals usando Axios
  try {
    const getTotalUrl = `${WEBHOOK_URL}crm.deal.list.json?start=-1&filter[>ID]=0`;
    const response = await axios.get(getTotalUrl);
    total = response.data.total;
  } catch (error) {
    console.error("Error al obtener el total de deals con Axios:", error);
    throw new Error("No se pudo obtener el total de deals desde Bitrix24.");
  }

  console.log(`Total de deals encontrados con Webhook: ${total}`);

  if (total === 0) {
    console.log("No hay deals para sincronizar. Proceso terminado.");
    return;
  }

  // El resto de la lógica no cambia
  const commands = [];
  for (let i = 0; i < total; i += DEALS_PER_CALL) {
    commands.push(`crm.deal.list?select[]=*&select[]=UF_*&start=${i}`);
  }

  for (let i = 0; i < commands.length; i += BATCH_SIZE) {
    const batchCmds = commands.slice(i, i + BATCH_SIZE);
    const cmdString = batchCmds
      .map((cmd) => `cmd[${cmd.split("?")[1]}] =${cmd.split("?")[0]}`)
      .join("&");
    const batchUrl = `${WEBHOOK_URL}batch`;

    // Aquí podemos seguir usando fetch para el POST, ya que es menos problemático.
    const postResponse = await fetch(batchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: cmdString,
    });
    const batchResult = await postResponse.json();

    if (!batchResult.result || !batchResult.result.result) continue;

    const dealsData = (
      Object.values(batchResult.result.result) as any[]
    ).flat();
    if (dealsData.length === 0) continue;

    const operations = dealsData.map((deal: any) => ({
      updateOne: {
        filter: { _id: deal.ID },
        update: {
          $set: {
            title: deal.TITLE,
            opportunity: deal.OPPORTUNITY,
            stageId: deal.STAGE_ID,
            assignedById: deal.ASSIGNED_BY_ID,
            companyId: deal.COMPANY_ID,
            contactIds: deal.CONTACT_IDS || [],
            dateCreate: deal.DATE_CREATE,
            lastUpdatedInB24: deal.DATE_MODIFY,
            syncedAt: new Date(),
            customFields: Object.fromEntries(
              Object.entries(deal).filter(([key]) => key.startsWith("UF_CRM_"))
            ),
          },
        },
        upsert: true,
      },
    }));

    await Deal.bulkWrite(operations);
    console.log(
      `Lote procesado. ${operations.length} deals guardados/actualizados.`
    );
    await delay(500);
  }

  console.log("¡Sincronización con Webhook completada!");
}
