import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}