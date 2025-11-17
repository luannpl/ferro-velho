import { productService } from "@/modules/product/product.service";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await productService.delete(Number(id));
    console.log(product);
    return NextResponse.json(
      { message: product.message },
      { status: product.status }
    );
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await productService.getById(Number(id));
    return NextResponse.json(product, { status: 200 });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const data = await req.json();
  const updatedProduct = await productService.update(productId, data);

  return NextResponse.json(
    {
      message: "Produto atualizado com sucesso",
      product: updatedProduct,
    },
    { status: 200 }
  );
}