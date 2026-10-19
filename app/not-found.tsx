import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Página não encontrada · Carlos Serra", robots: { index: false } };

/* 404: o endereço caiu no buraco negro. Os links usam caminho relativo ao basePath. */
export default function NaoEncontrada() {
  return (
    <section className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-24 text-center">
      <div aria-hidden="true" className="absolute left-1/2 top-[30%] size-[min(70vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#000_52%,rgba(176,208,255,.55)_55%,rgba(176,208,255,.08)_62%,transparent_72%)]" />
      <div className="relative grid justify-items-center gap-5">
        <Logo size={64} />
        <p className="kicker">Erro 404</p>
        <h1 className="gothic chrome-text text-[clamp(3rem,12vw,7rem)]">Página perdida</h1>
        <p className="lede text-lg">Este endereço caiu no buraco negro. O site continua no mesmo lugar.</p>
        <a href="/leadpagecarlos2.0/" className="btn btn-chrome mt-2">
          Voltar ao início
        </a>
      </div>
    </section>
  );
}
