"use client";

/* Peças da cena espacial usadas pelo hero e pela galáxia de projetos */
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "@/lib/rng";
import type { Tier } from "@/lib/useDeviceTier";
import { stars } from "@/components/hero/shaders/space";

export type Q = Exclude<Tier, "off">;

/* Qualidade do ray tracer por nível de aparelho:
   passos = quantos trechos cada raio de luz percorre; escala = resolução do canvas em relação à tela */
export const QUALIDADE: Record<Q, { passos: number; oitavas: number; escala: number }> = {
  high: { passos: 220, oitavas: 5, escala: 0.85 },
  mid: { passos: 160, oitavas: 4, escala: 0.65 },
  low: { passos: 110, oitavas: 3, escala: 0.6 },
};

export const ease = (x: number) => x * x * (3 - 2 * x);
export const damp = (atual: number, alvo: number, lambda: number, dt: number) => THREE.MathUtils.lerp(atual, alvo, 1 - Math.exp(-lambda * dt));

/* ---------------- estrelas (galáxia de projetos) ---------------- */
function camada(n: number, rMin: number, rMax: number, tamanho: number, seed: number) {
  const rnd = rng(seed);
  const pos = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const sd = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const r = rMin + rnd() * (rMax - rMin);
    const k = Math.sqrt(1 - u * u);
    pos.set([Math.cos(th) * k * r, u * r * 0.8, Math.sin(th) * k * r], i * 3);
    size[i] = tamanho * (0.4 + Math.pow(rnd(), 3) * 1.8);
    sd[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
  return g;
}

export function Estrelas({ q, dpr }: { q: Q; dpr: number }) {
  const f = q === "low" ? 0.5 : q === "mid" ? 0.75 : 1;
  const camadas = useMemo(
    () => [camada(Math.round(2200 * f), 55, 75, 1.4, 7), camada(Math.round(900 * f), 30, 45, 1.5, 13), camada(Math.round(260 * f), 16, 24, 1.7, 29)],
    [f],
  );
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...stars,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [dpr],
  );
  useFrame((_, dt) => (mat.uniforms.uTime.value += Math.min(dt, 0.1)));
  return (
    <group>
      {camadas.map((g, i) => (
        <points key={i} geometry={g} material={mat} renderOrder={-5} />
      ))}
    </group>
  );
}
