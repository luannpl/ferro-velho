import { ArrowUpRight } from "lucide-react";

export default function InfoTransacao() {
    return (
        <div className="rounded-xl border border-gray-100 p-4 flex flex-col w-full">
            <div className="flex items-center">
                <div className="rounded-full bg-green-100 text-green-500 p-2"><ArrowUpRight /></div>
                <div className="ml-2">
                    <div>Are you absolutely sure?</div>
                    <p className="text-muted-foreground text-sm">data</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-2">
                    <div className="font-semibold">Are you absolutely sure?</div>
                    <p className="text-muted-foreground text-sm">data</p>
                </div>
            </div>
        </div>
    )
}