import { vendasService } from "@/modules/vendas/vendas.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const period = (searchParams.get("period") || "month") as "week" | "month" | "year";

        const chartData = await vendasService.getChartData(period);

        return NextResponse.json(chartData, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
