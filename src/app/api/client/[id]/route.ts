import { clientService } from "@/modules/client/client.service";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await clientService.delete(clientId);

    return NextResponse.json(
      { message: "Cliente deletado com sucesso" },
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
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const data = await req.json();
    const updatedClient = await clientService.update(clientId, data);

    return NextResponse.json(
      {
        message: "Cliente atualizado com sucesso",
        client: updatedClient,
      },
      { status: 200 }
    );
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
