import { clientService } from "@/modules/client/client.service";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ agora correto
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await clientService.delete(clientId);

    return NextResponse.json(
      { message: "Cliente deletado com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
