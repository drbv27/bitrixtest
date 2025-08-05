// src/app/api/sync/daily/route.ts
import { syncDealsWithWebhook } from "@/lib/bitrix24-sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const totalProcessed = await syncDealsWithWebhook();
    return NextResponse.json({
      success: true,
      message: `Sincronización completada. Deals procesados: ${totalProcessed}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
