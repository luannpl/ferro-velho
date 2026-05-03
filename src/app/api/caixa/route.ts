import {caixaService} from "@/modules/caixa/caixa.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    const caixas = await caixaService.getAll(page, limit);
    return NextResponse.json(caixas);
}


export async function POST(req: Request) {
    try {
        const data = await req.json();
        const caixa = await caixaService.create(data);
        return NextResponse.json(caixa, {status: 201});
    }catch (error: any) {
        return NextResponse.json({error: error.message});
    }
}