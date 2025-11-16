// app/api/compras/route.ts (com a correção de tipo)

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
  } catch (error: unknown) { // 👈 Mude 'error: any' para 'error: unknown'
    // Garantir que o objeto 'error' tem a propriedade 'message'
    const errorMessage = 
      error instanceof Error 
        ? error.message 
        : "Erro desconhecido ao processar a compra.";
        
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}