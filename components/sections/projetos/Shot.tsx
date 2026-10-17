import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";

/* Captura de tela do projeto com tamanho reservado (sem pulo de layout) */
export function Shot({ shot, alt, className, sizes = "(max-width: 768px) 86vw, 420px", eager }: { shot: string; alt: string; className?: string; sizes?: string; eager?: boolean }) {
  return (
    <img
      src={asset(`/projetos/${shot}-1-640.webp`)}
      srcSet={`${asset(`/projetos/${shot}-1-640.webp`)} 640w, ${asset(`/projetos/${shot}-1-1280.webp`)} 1280w`}
      sizes={sizes}
      width={1280}
      height={800}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("aspect-[16/10] w-full object-cover object-top", className)}
    />
  );
}
