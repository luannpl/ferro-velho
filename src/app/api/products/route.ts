import { NextResponse } from "next/server";
import { productService } from "@/modules/product/product.service";

export async function GET() {
  const products = await productService.getAll();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const product = await productService.create(data);
    return NextResponse.json(product, { status: 201 });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
