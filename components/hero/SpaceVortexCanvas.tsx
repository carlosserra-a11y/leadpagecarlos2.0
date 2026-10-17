"use client";

import { forwardRef, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { rendererSoftware, type Tier } from "@/lib/useDeviceTier";
import { AnelDeFotons, DiscoDeGas, Estrelas, Fragmentos, Nebulosa, Poeira, damp, ease, type Fase, type Q } from "@/components/three/partes";
import { heroState } from "./heroState";
import { LensingEffect } from "./shaders/lensing";

const BASE_TILT = 0.13;
const BASE_ROLL = -0.09;

/* ---------------- câmera, rolagem e anel gótico ---------------- */
function Rig({ q, fase, lens, grupo }: { q: Q; fase: RefObject<Fase>; lens: RefObject<LensingEffect | null>; grupo: RefObject<THREE.Group | null> }) {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const alvo = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const centro = useMemo(() => new THREE.Vector2(), []);
  const vel = useRef(1);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const p = heroState.p;
    const e = ease(p);

    // velocidade do disco aumenta com a rolagem; a fase acumula (sem saltos)
    vel.current = damp(vel.current, 1 + 2.6 * e, 4, dt);
    fase.current.phase += dt * 0.55 * vel.current;
    fase.current.time += dt;

    // parallax do mouse (lerp ~0,05 por quadro) + dolly em direção à singularidade
    // tela em pé (celular): câmera mais longe para o disco caber na largura
    const longe = size.width / size.height < 0.8 ? 15.5 : 11.5;
    alvo.set(heroState.px * 0.9, 1.05 - heroState.py * 0.5, THREE.MathUtils.lerp(longe, 2.75, e));
    cam.position.x = damp(cam.position.x, alvo.x, 3, dt);
    cam.position.y = damp(cam.position.y, alvo.y, 3, dt);
    cam.position.z = damp(cam.position.z, alvo.z, 6, dt);
    cam.lookAt(0, 0, 0);
    const fov = 40 + 16 * e;
    if (Math.abs(cam.fov - fov) > 0.01) cam.fov = fov;
    // o buraco negro fica na altura definida pelo CSS (--bh-y), não no meio da tela
    cam.setViewOffset(size.width, size.height, 0, size.height * (0.5 - heroState.bhY), size.width, size.height);
    cam.updateProjectionMatrix();

    if (grupo.current) {
      grupo.current.rotation.x = damp(grupo.current.rotation.x, BASE_TILT + heroState.py * 0.07, 2.5, dt);
      grupo.current.rotation.z = damp(grupo.current.rotation.z, BASE_ROLL - heroState.px * 0.05, 2.5, dt);
    }

    // centro e raio aparente do horizonte, na tela
    proj.set(0, 0, 0).project(cam);
    const dist = cam.position.length();
    const raioNdc = 1 / dist / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const cx = (proj.x * 0.5 + 0.5) * size.width;
    const cy = (1 - (proj.y * 0.5 + 0.5)) * size.height;
    const raioPx = raioNdc * (size.height / 2);

    // anel gótico acompanha a câmera (o elemento fica ancorado em 50% / --bh-y)
    const ring = heroState.ring;
    if (ring) {
      const s = Math.min(raioPx * 1.75, size.width * 0.46) / 245;
      const dx = cx - size.width / 2;
      const dy = cy - size.height * heroState.bhY;
      ring.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      ring.style.opacity = String(1 - Math.min(1, Math.max(0, (p - 0.08) / 0.35)));
    }

    if (lens.current) {
      centro.set(cx / size.width, 1 - cy / size.height);
      // a lente perde força quando a câmera chega perto (senão o disco da frente se deforma demais)
      lens.current.set(centro, raioNdc / 2, size.width / size.height, (q === "high" ? 0.6 : 0.45) * (1 - 0.75 * e));
    }
  });
  return null;
}

/* ---------------- monitor de FPS ---------------- */
function Vigia({ onLento, onPronto }: { onLento: (mediana: number) => void; onPronto: () => void }) {
  const amostras = useRef<number[]>([]);
  const quadros = useRef(0);
  const avisou = useRef(false);
  useFrame((_, dt) => {
    quadros.current++;
    if (quadros.current === 3 && !avisou.current) {
      avisou.current = true;
      onPronto();
    }
    if (quadros.current < 40) return; // ignora o aquecimento (compilação de shaders)
    amostras.current.push(dt * 1000);
    if (amostras.current.length >= 90) {
      const ord = [...amostras.current].sort((a, b) => a - b);
      const mediana = ord[ord.length >> 1];
      amostras.current = [];
      // abaixo de ~30 fps, desce um nível de qualidade
      if (mediana > 34) onLento(mediana);
    }
  });
  return null;
}

const Lente = forwardRef<LensingEffect>(function Lente(_, ref) {
  const efeito = useMemo(() => new LensingEffect(), []);
  return <primitive ref={ref} object={efeito} dispose={null} />;
});

function Cena({ q, dpr, onLento, onPronto }: { q: Q; dpr: number; onLento: (mediana: number) => void; onPronto: () => void }) {
  const fase = useRef<Fase>({ phase: 0, time: 0 });
  const lens = useRef<LensingEffect>(null);
  const grupo = useRef<THREE.Group>(null);
  return (
    <>
      <color attach="background" args={["#020205"]} />
      <Nebulosa q={q} />
      <Estrelas q={q} dpr={dpr} />
      <group ref={grupo} rotation={[BASE_TILT, 0, BASE_ROLL]}>
        <mesh renderOrder={0}>
          <sphereGeometry args={[1, 64, 48]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <DiscoDeGas q={q} fase={fase} />
        <Fragmentos q={q} fase={fase} />
      </group>
      <AnelDeFotons q={q} fase={fase} />
      <Poeira q={q} dpr={dpr} />
      <Rig q={q} fase={fase} lens={lens} grupo={grupo} />
      <Vigia onLento={onLento} onPronto={onPronto} />
      {q !== "low" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Lente ref={lens} />
          <Bloom mipmapBlur intensity={q === "high" ? 0.7 : 0.55} luminanceThreshold={0.42} luminanceSmoothing={0.25} radius={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

export default function SpaceVortexCanvas({ tier, trackRef, onPronto }: { tier: Exclude<Tier, "off">; trackRef: RefObject<HTMLElement | null>; onPronto: () => void }) {
  const [q, setQ] = useState<Q>(tier);
  const [ativo, setAtivo] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const dpr = q === "high" ? 1.5 : q === "mid" ? 1.25 : 1;

  // pausa quando o hero sai da tela ou a aba fica escondida
  useEffect(() => {
    const el = trackRef.current;
    let visivel = true;
    const atualizar = () => setAtivo(visivel && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      atualizar();
    });
    if (el) io.observe(el);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [trackRef]);

  if (falhou) return null;

  return (
    <Canvas
      flat
      linear
      dpr={[1, dpr]}
      frameloop={ativo ? "always" : "never"}
      camera={{ fov: 40, near: 0.1, far: 200, position: [0, 1.05, 11.5] }}
      gl={{ antialias: q !== "low", alpha: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        // shader que não compila ou contexto perdido: fica o pôster
        gl.debug.onShaderError = () => setFalhou(true);
        gl.domElement.addEventListener("webglcontextlost", () => setFalhou(true), { once: true });
        // sem placa de vídeo, começa no nível mais leve
        if (rendererSoftware(gl.getContext())) setQ("low");
      }}
    >
      <Cena
        q={q}
        dpr={dpr}
        onPronto={() => {
          onPronto();
          window.dispatchEvent(new Event("lp2-cena"));
        }}
        onLento={(mediana) => {
          // já no mínimo e ainda travando (abaixo de ~20 fps): desiste do 3D e fica o pôster
          if (q === "low" && mediana > 50) setFalhou(true);
          else setQ((v) => (v === "high" ? "mid" : "low"));
        }}
      />
    </Canvas>
  );
}
