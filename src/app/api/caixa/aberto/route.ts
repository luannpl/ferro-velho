import { caixaService } from "@/modules/caixa/caixa.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const caixaAberto = await caixaService.findCaixaAberto();
        
        if (caixaAberto) {
            return NextResponse.json({ caixa: caixaAberto }, { status: 200 });
        } else {
            // Retorna 404 para indicar que não há caixa aberto
            return NextResponse.json({ message: "Nenhum caixa aberto." }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}