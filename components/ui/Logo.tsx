import { cn } from "@/lib/cn";
import { LOGO_CS } from "./logoPath";

/* Monograma "CS" em gótica dentro do horizonte de eventos, com o arco do disco de acreção */
export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn("flex-none", className)} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset=".1" stopColor="#fff6d6" />
          <stop offset=".55" stopColor="#f2c14e" />
          <stop offset="1" stopColor="#b06d1a" />
        </linearGradient>
        <radialGradient id="logo-v" cx=".5" cy=".5" r=".5">
          <stop offset=".62" stopColor="#020205" />
          <stop offset="1" stopColor="#1a1030" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#logo-v)" />
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#logo-g)" strokeWidth="1.4" opacity=".9" />
      <path d="M5.5 38.5c9 7.5 45 6.5 53-9.5" fill="none" stroke="#f2c14e" strokeWidth="2.2" strokeLinecap="round" opacity=".85" />
      <path d={LOGO_CS} fill="url(#logo-g)" />
    </svg>
  );
}
