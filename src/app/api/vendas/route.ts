import { vendasService } from "@/modules/vendas/vendas.service";
import { NextResponse } from "next/server";

export async function GET() {
  const vendas = await vendasService.findAll();
  return NextResponse.json(vendas);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const venda = await vendasService.create(data);
    return NextResponse.json(venda, { status: 201 });
  } catch (error: unknown) { // 👈 Mude 'error: any' para 'error: unknown'
    // Garantir que o objeto 'error' tem a propriedade 'message'
    const errorMessage = 
      error instanceof Error 
        ? error.message 
        : "Erro desconhecido ao processar a venda.";
        
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}