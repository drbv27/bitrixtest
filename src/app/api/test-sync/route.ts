// src/app/api/test-sync/route.ts
import { syncAllDeals } from "@/lib/bitrix24-sync";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await syncAllDeals();
    return NextResponse.json({
      success: true,
      message: "Sincronización completada.",
    });
  } catch (error: any) {
    console.error("Fallo en la sincronización manual:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
