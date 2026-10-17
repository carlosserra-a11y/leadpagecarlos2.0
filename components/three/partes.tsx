"use client";

/* Peças da cena espacial usadas pelo hero e pela galáxia de projetos */
import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { rng } from "@/lib/rng";
import { INSTANCIAS, type Tier } from "@/lib/useDeviceTier";
import { dust, nebula, stars } from "@/components/hero/shaders/space";
import { fragments, gasDisk, photonRing } from "@/components/hero/shaders/disk";

export type Q = Exclude<Tier, "off">;
export const R_IN = 1.45; // borda interna do disco (em raios do horizonte)
export const R_OUT = 5.4;

/* Formato dos fragmentos do disco. Para trocar por bananas (prompt de referência),
   troque esta geometria por uma banana (ex.: useGLTF) — o shader cuida da órbita. */
const criarGeometriaFragmento = () => new THREE.OctahedronGeometry(1, 0);

export const ease = (x: number) => x * x * (3 - 2 * x);
export const damp = (atual: number, alvo: number, lambda: number, dt: number) => THREE.MathUtils.lerp(atual, alvo, 1 - Math.exp(-lambda * dt));

/* ---------------- fundo: nebulosa, estrelas e poeira ---------------- */
export function Nebulosa({ q }: { q: Q }) {
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ ...nebula(q === "low" ? 3 : 5), uniforms: { uTime: { value: 0 } }, side: THREE.BackSide, depthWrite: false }),
    [q],
  );
  useFrame((_, dt) => (mat.uniforms.uTime.value += Math.min(dt, 0.1)));
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[90, 48, 32]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

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

export function Poeira({ q, dpr }: { q: Q; dpr: number }) {
  const n = q === "low" ? 120 : q === "mid" ? 260 : 420;
  const geo = useMemo(() => {
    const rnd = rng(4242);
    const pos = new Float32Array(n * 3);
    const sd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([(rnd() - 0.5) * 18, (rnd() - 0.5) * 8, -3 + rnd() * 13], i * 3);
      sd[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    return g;
  }, [n]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...dust,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [dpr],
  );
  useFrame((_, dt) => (mat.uniforms.uTime.value += Math.min(dt, 0.1)));
  return <points geometry={geo} material={mat} renderOrder={5} />;
}

/* ---------------- o buraco negro ---------------- */
export type Fase = { phase: number; time: number };

export function DiscoDeGas({ q, fase }: { q: Q; fase: RefObject<Fase> }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...gasDisk(q === "low" ? 3 : 4),
        uniforms: { uPhase: { value: 0 }, uRin: { value: R_IN }, uRout: { value: R_OUT }, uIntensity: { value: q === "low" ? 0.75 : 0.55 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [q],
  );
  useFrame(() => (mat.uniforms.uPhase.value = fase.current.phase));
  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={1}>
      <ringGeometry args={[R_IN - 0.05, R_OUT, 160, 24]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export function Fragmentos({ q, fase }: { q: Q; fase: RefObject<Fase> }) {
  const max = INSTANCIAS[q];
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = criarGeometriaFragmento();
    const rnd = rng(99991);
    const orbit = new Float32Array(max * 4);
    const spin = new Float32Array(max * 4);
    for (let i = 0; i < max; i++) {
      // mais fragmentos perto do centro, como num disco de verdade
      const r = R_IN + Math.pow(rnd(), 1.6) * (R_OUT - R_IN);
      const h = (rnd() + rnd() + rnd() - 1.5) / 1.5;
      const big = rnd() > 0.965;
      orbit.set([r, rnd() * Math.PI * 2, h, (big ? 0.05 : 0.014) + rnd() * (big ? 0.035 : 0.022)], i * 4);
      spin.set([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5, 0.4 + rnd() * 2.2], i * 4);
    }
    g.setAttribute("aOrbit", new THREE.InstancedBufferAttribute(orbit, 4));
    g.setAttribute("aSpin", new THREE.InstancedBufferAttribute(spin, 4));
    return g;
  }, [max]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...fragments,
        uniforms: { uPhase: { value: 0 }, uTime: { value: 0 }, uRin: { value: R_IN }, uRout: { value: R_OUT }, uInflow: { value: 0.045 } },
      }),
    [],
  );
  useFrame(() => {
    mat.uniforms.uPhase.value = fase.current.phase;
    mat.uniforms.uTime.value = fase.current.time;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, max]} frustumCulled={false} renderOrder={2} />;
}

export function AnelDeFotons({ q, fase }: { q: Q; fase: RefObject<Fase> }) {
  const SIZE = 5.2;
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...photonRing(q === "low" ? 3 : 4),
        uniforms: { uPhase: { value: 0 }, uSize: { value: SIZE }, uTilt: { value: 0.5 }, uIntensity: { value: q === "low" ? 1.15 : 0.9 } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [q],
  );
  useFrame(() => (mat.uniforms.uPhase.value = fase.current.phase));
  return (
    <Billboard renderOrder={3}>
      <mesh renderOrder={3}>
        <planeGeometry args={[SIZE, SIZE]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </Billboard>
  );
}

