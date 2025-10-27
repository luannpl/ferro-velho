import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CardNavProps {
  href: string;
  icon: LucideIcon;
  title: string;
}

export function CardNav({ href, icon: Icon, title }: CardNavProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 border border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 hover:scale-105 hover:border-blue-400 w-full h-32"
    >
      <div className="text-3xl mb-3 text-blue-400">
        <Icon />
      </div>
      <h2 className="text-lg font-semibold text-white text-center">{title}</h2>
    </Link>
  );
}