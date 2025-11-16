import { compraService } from "@/modules/compras/compra.service";
import { NextResponse } from "next/server";

export async function GET() {
  const compras = await compraService.findAll();
  return NextResponse.json(compras);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const compra = await compraService.create(data);
    return NextResponse.json(compra, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro desconhecido ao processar a compra." }, { status: 400 });
  }
}