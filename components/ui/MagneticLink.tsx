"use client";

import { useRef } from "react";
import { useMagnetic } from "./useMagnetic";
import { cn } from "@/lib/cn";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "gold" | "ghost"; small?: boolean };

export function MagneticLink({ variant = "gold", small, className, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);
  const external = rest.href?.startsWith("http");
  return (
    <a
      ref={ref}
      className={cn("btn", variant === "gold" ? "btn-gold" : "btn-ghost", small && "btn-sm", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      {...rest}
    >
      {children}
    </a>
  );
}
