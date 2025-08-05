// src/app/api/manual-sync/route.ts
import { auth } from "@/auth";
import { syncAllDeals } from "@/lib/bitrix24-sync";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.accessToken || !session.portalUrl) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Usamos el token de la sesión activa para la sincronización
    await syncAllDeals(session.accessToken, session.portalUrl);
    return NextResponse.json({
      success: true,
      message: "Sincronización completada.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
