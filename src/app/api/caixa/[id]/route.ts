import { caixaService } from "@/modules/caixa/caixa.service";
import { NextResponse } from "next/server";

// PATCH (ou PUT) para fechar o caixa
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: paramId } = await params; // Desestrutura o id do params

    try {
        const id = Number(paramId);

        const caixaFechado = await caixaService.fecharCaixa(id);

        return NextResponse.json(caixaFechado, { status: 200 });
    } catch (error: any) {
        console.error("Erro no PATCH /caixa/[id]:", error);
        // O erro original da aplicação (se não for o erro de params)
        return NextResponse.json({ error: error.message || "Erro interno do servidor." }, { status: 400 });
    }
}

// Opcional: GET para buscar um caixa específico
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await params;
        const id = Number(paramId);
        const caixa = await caixaService.getById(id);
        return NextResponse.json(caixa, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}