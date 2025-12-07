import React from 'react';

interface CardInfoProps {
    title: string;
    valor: number;
    icon: React.ReactNode; 
    bgColor?: string;
}
export default function CardInfo({ title, valor, icon, bgColor }: CardInfoProps) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-lg shadow ${bgColor ?? ''}`}>
            <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">{title}</p>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    R$ {valor}
                </h4>
            </div>
            <div className="flex items-center justify-end">
                {icon}
            </div>
        </div>
    )
}