import { ArrowUpRight } from "lucide-react";

interface InfoTransacaoProps {
    title: string;
    valor: number;
    tipo: string;
    data: string;
    icon: React.ReactNode;
    bgColorIcon: string;
    textColorIcon: string;
    textColorValue: string;
}

export default function InfoTransacao({
    title,
    valor,
    tipo,
    data,
    icon,
    bgColorIcon,
    textColorIcon,
    textColorValue
}: InfoTransacaoProps) {
    return (
        <div className="rounded-xl border border-gray-100 p-4 flex flex-col w-full">
            <div className="flex items-center">
                <div className={`rounded-full p-2 ${bgColorIcon} ${textColorIcon}`}>{icon}</div>
                <div className="ml-2">
                    <div>{title}</div>
                    <p className="text-muted-foreground text-sm">{data}</p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                    <h4 className={`scroll-m-20 text-xl font-semibold tracking-tight ${textColorValue}`}>+ R$ {valor}</h4>
                    <p className="text-muted-foreground text-sm">{tipo}</p>
                </div>
            </div>
        </div>
    )
}