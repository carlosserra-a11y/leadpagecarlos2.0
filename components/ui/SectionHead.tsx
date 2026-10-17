import { Words } from "./Words";
import { cn } from "@/lib/cn";

export function SectionHead({ k, t, p, id, className, center }: { k: string; t: string; p?: string; id?: string; className?: string; center?: boolean }) {
  return (
    <header className={cn("grid gap-4", center && "justify-items-center text-center", className)}>
      <p className="kicker" data-reveal>
        <span aria-hidden="true">✦ </span>
        {k}
      </p>
      <Words id={id} text={t} className="title text-[clamp(2.4rem,6vw,4.6rem)] text-text" />
      {p && (
        <p className="lede text-lg" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
          {p}
        </p>
      )}
    </header>
  );
}
