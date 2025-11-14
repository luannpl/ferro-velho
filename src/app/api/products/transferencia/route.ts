import { productService } from "@/modules/product/product.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await productService.transferProduct(data);
    return NextResponse.json(result, { status: 200 });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
