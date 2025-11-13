import { productService } from "@/modules/product/product.service";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }>     }) {
  try{
    const { id } = await context.params;
    const product = await productService.delete(Number(id));
    console.log(product);
    return NextResponse.json({ message: product.message }, { status: product.status });
  }catch (error: any) {
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
  }catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}