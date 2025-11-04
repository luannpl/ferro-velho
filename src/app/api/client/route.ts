import { clientService } from "@/modules/client/client.service";
import { NextResponse } from "next/server";

export async function GET() {
  const clients = await clientService.getAll();
  return NextResponse.json(clients, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const client = await clientService.create(data);
    return NextResponse.json(client, { status: 201 });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
