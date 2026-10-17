import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Junta classes do Tailwind sem conflito (padrão shadcn)
export const cn = (...v: ClassValue[]) => twMerge(clsx(v));
