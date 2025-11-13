import { fornecedorService } from "@/modules/fornecedores/fornecedores.service";
import { NextResponse } from "next/server";

export async function GET() {
  const fornecedores = await fornecedorService.getAll();
  return NextResponse.json(fornecedores);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const fornecedor = await fornecedorService.create(data);
    return NextResponse.json(fornecedor, { status: 201 });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
