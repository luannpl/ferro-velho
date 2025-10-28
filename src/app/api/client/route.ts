import { clientService } from "@/modules/client/client.service";
import { NextResponse } from "next/server";

export async function GET() {
  const clients = await clientService.getAll();
  return NextResponse.json(clients, { status: 200 });
}
