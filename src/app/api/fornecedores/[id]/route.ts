import { fornecedorService } from "@/modules/fornecedores/fornecedores.service";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const fornecedorId = Number(id);

    if (isNaN(fornecedorId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await fornecedorService.delete(fornecedorId);

    return NextResponse.json(
      { message: "Fornecedor deletado com sucesso" },
      { status: 200 }
    );
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const fornecedorId = Number(id);

    if (isNaN(fornecedorId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const data = await req.json();
    const updatedFornecedor = await fornecedorService.update(fornecedorId, data);

    return NextResponse.json(
      {
        message: "Fornecedor atualizado com sucesso",
        client: updatedFornecedor,
      },
      { status: 200 }
    );
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
