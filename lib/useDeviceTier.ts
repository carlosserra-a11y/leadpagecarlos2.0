"use client";

import { useEffect, useState } from "react";

/* Nível do aparelho decide a qualidade do 3D.
   off = pôster estático (sem WebGL, "reduzir movimento" ou economia de dados). */
export type Tier = "high" | "mid" | "low" | "off";

type NavExtra = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

let cache: Tier | null = null;

/* Checagem leve (sem criar contexto WebGL: isso trava a página em celular lento).
   A placa de vídeo de verdade é conferida depois, dentro do canvas 3D (rendererSoftware). */
export function detectTier(): Tier {
  if (cache) return cache;
  if (typeof window === "undefined") return "off";
  // ?tier=high|mid|low|off força um nível (testes e geração do pôster)
  const forcado = new URLSearchParams(location.search).get("tier");
  if (forcado === "high" || forcado === "mid" || forcado === "low" || forcado === "off") return (cache = forcado);
  const nav = navigator as NavExtra;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || nav.connection?.saveData) return (cache = "off");
  if (typeof WebGLRenderingContext === "undefined") return (cache = "off");
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 4;
  const mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
  if (mobile || mem <= 2) return (cache = "low");
  if (cores >= 8 && mem >= 8 && innerWidth >= 1200) return (cache = "high");
  return (cache = "mid");
}

/** WebGL sem placa de vídeo (renderização por software): o 3D começa no mínimo */
export function rendererSoftware(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  try {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const r = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    return /swiftshader|llvmpipe|software|basic render/i.test(r);
  } catch {
    return false;
  }
}

/** null enquanto não montou no navegador (no HTML estático sempre vale o pôster) */
export function useDeviceTier(): Tier | null {
  const [tier, setTier] = useState<Tier | null>(null);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o nível só existe no navegador (o HTML estático usa o pôster)
    setTier(detectTier());
    const mudou = () => {
      cache = null; // a pessoa ligou ou desligou "reduzir movimento"
      setTier(detectTier());
    };
    mq.addEventListener("change", mudou);
    return () => mq.removeEventListener("change", mudou);
  }, []);
  return tier;
}

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

/** true só quando o aparelho tem mouse de verdade (cursor e efeitos de hover) */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}
