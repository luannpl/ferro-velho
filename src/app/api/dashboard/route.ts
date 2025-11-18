import { compraService } from "@/modules/compras/compra.service";
import { productService } from "@/modules/product/product.service";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const {totalProducts, totalInStock} = await productService.getProductsData();
        const salesToday = await compraService.getTotalSalesToday();
        const dashboardData = {
            totalProducts,
            totalInStock,
            salesToday
        };
        return NextResponse.json(dashboardData, { status: 200 });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

}