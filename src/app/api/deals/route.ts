// src/app/api/deals/route.ts
import { auth } from "@/auth";
import { getDeals } from "@/lib/bitrix24-api";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken || !session.portalUrl) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dealsData = await getDeals(session.accessToken, session.portalUrl);

  if (!dealsData) {
    return NextResponse.json(
      { error: "No se pudieron obtener los deals" },
      { status: 500 }
    );
  }

  return NextResponse.json(dealsData);
}
