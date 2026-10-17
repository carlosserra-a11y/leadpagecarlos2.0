import { Fragment } from "react";
import { cn } from "@/lib/cn";

/* Título que sobe palavra por palavra, com máscara. O texto continua inteiro para leitores de tela. */
export function Words({ text, className, as: Tag = "h2", id }: { text: string; className?: string; as?: "h1" | "h2" | "h3" | "p"; id?: string }) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={cn("words", className)}>
      {words.map((w, i) => (
        // o espaço fica fora do bloco mascarado, senão o navegador o descarta
        <Fragment key={`${w}-${i}`}>
          <span className="w">
            <span style={{ "--i": i } as React.CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
