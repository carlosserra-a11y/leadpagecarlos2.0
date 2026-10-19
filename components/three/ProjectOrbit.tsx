"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Billboard, RoundedBox, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { asset } from "@/lib/asset";
import { PROJETOS } from "@/lib/dados";
import type { Tier } from "@/lib/useDeviceTier";
import type { Progresso } from "@/components/sections/projetos/Galaxia";
import { heroState } from "@/components/hero/heroState";
import { gargantuaSprite } from "@/components/hero/shaders/gargantua";
import { Estrelas, damp, type Q } from "./partes";

const N = PROJETOS.length;
const PASSO = (Math.PI * 2) / N;
const W = 2.4; // monólito 16:10, como as capturas
const H = 1.5;
const RX = 3.5; // órbita elíptica
const RZ = 2.7;

type Props = { prog: RefObject<Progresso>; ativo: number; tier: Tier | null; onPick: (i: number) => void };

/* Um monólito de vidro escuro com a captura do site na frente e borda prateada que acende */
function Monolito({ i, tex, ativo, hover, setHover, onPick }: { i: number; tex: THREE.Texture; ativo: boolean; hover: boolean; setHover: (i: number | null) => void; onPick: (i: number) => void }) {
  const grupo = useRef<THREE.Group>(null);
  const tela = useRef<THREE.MeshBasicMaterial>(null);
  const borda = useRef<THREE.LineBasicMaterial>(null);
  const bordaGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(W + 0.06, H + 0.06, 0.1)), []);
  const cor = useMemo(() => new THREE.Color(PROJETOS[i].cor), [i]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const g = grupo.current;
    if (!g) return;
    const aceso = ativo || hover;
    // hover inclina, o ativo vem um pouco para frente
    g.rotation.x = damp(g.rotation.x, hover ? -0.08 : 0, 6, dt);
    g.rotation.z = damp(g.rotation.z, hover ? 0.03 : 0, 6, dt);
    const s = damp(g.scale.x, ativo ? 1.1 : hover ? 1.04 : 0.92, 5, dt);
    g.scale.setScalar(s);
    if (tela.current) {
      const b = damp(tela.current.color.r, ativo ? 1 : hover ? 0.85 : 0.42, 5, dt);
      tela.current.color.setScalar(b);
    }
    if (borda.current) borda.current.opacity = damp(borda.current.opacity, aceso ? 1 : 0.18, 6, dt);
  });

  return (
    <group ref={grupo}>
      <RoundedBox
        args={[W + 0.08, H + 0.08, 0.08]}
        radius={0.04}
        smoothness={3}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHover(i);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick(i);
        }}
      >
        <meshStandardMaterial color="#081120" metalness={0.7} roughness={0.28} emissive={cor} emissiveIntensity={0.04} />
      </RoundedBox>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial ref={tela} map={tex} toneMapped={false} />
      </mesh>
      {/* reflexo de vidro por cima da captura */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <lineSegments geometry={bordaGeo}>
        <lineBasicMaterial ref={borda} color="#c9d6e8" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}

function Orbita({ prog, ativo, onPick }: Omit<Props, "tier">) {
  const urls = useMemo(() => PROJETOS.map((p) => asset(`/projetos/${p.shot}-1-1280.webp`)), []);
  const texturas = useTexture(urls) as THREE.Texture[];
  const { gl, size } = useThree();
  const [hover, setHover] = useState<number | null>(null);
  const itens = useRef<(THREE.Group | null)[]>([]);
  const giro = useRef(0);

  useEffect(() => {
    for (const t of texturas) {
      t.colorSpace = THREE.NoColorSpace; // o canvas é "linear": mostra os pixels como estão
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      t.needsUpdate = true;
    }
  }, [texturas, gl]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    // a rolagem traz um projeto por vez para a frente
    const alvo = prog.current.p * (N - 1) * PASSO;
    giro.current = damp(giro.current, alvo, 4, dt);
    // a órbita fica à esquerda; o painel de texto ocupa a direita
    const aspect = size.width / size.height;
    const cx = -Math.min(3.1, 0.95 * aspect + 0.6);
    itens.current.forEach((g, i) => {
      if (!g) return;
      const a = i * PASSO - giro.current + Math.PI / 2;
      g.position.set(cx + Math.cos(a) * RX, Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.06, Math.sin(a) * RZ);
      // de frente para quem olha quando chega na frente
      g.rotation.y = damp(g.rotation.y, Math.cos(a) * -0.55, 6, dt);
    });
    // parallax leve com o mouse
    const cam = state.camera;
    cam.position.x = damp(cam.position.x, heroState.px * 0.35, 2.5, dt);
    cam.position.y = damp(cam.position.y, 1.1 - heroState.py * 0.25, 2.5, dt);
    cam.lookAt(cx * 0.55, -0.15, 0);
  });

  return (
    <>
      {PROJETOS.map((p, i) => (
        <group key={p.slug} ref={(g) => void (itens.current[i] = g)}>
          <Monolito i={i} tex={texturas[i]} ativo={i === ativo} hover={hover === i} setHover={setHover} onPick={onPick} />
        </group>
      ))}
    </>
  );
}

/* O mesmo buraco negro do hero (ray tracing), desenhado num plano que encara a câmera */
function Singularidade({ q }: { q: Q }) {
  const g = useRef<THREE.Group>(null);
  const { size } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...gargantuaSprite(q === "high" ? 150 : 120, 4),
        uniforms: {
          uOlho: { value: new THREE.Vector3(0, 2.2, 30) },
          uAbertura: { value: 0.62 },
          uTime: { value: 0 },
          uPhase: { value: 0 },
          uDoppler: { value: 0.72 },
          uExposure: { value: 1.15 },
        },
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      }),
    [q],
  );
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    mat.uniforms.uTime.value += dt;
    mat.uniforms.uPhase.value += dt * 0.8;
    if (g.current) g.current.position.x = -Math.min(3.1, 0.95 * (size.width / size.height) + 0.6);
  });
  return (
    <group ref={g} position={[0, -0.1, -0.3]}>
      <Billboard>
        <mesh renderOrder={-1}>
          <planeGeometry args={[5.4, 5.4]} />
          <primitive object={mat} attach="material" />
        </mesh>
      </Billboard>
    </group>
  );
}

/* o mesmo campo profundo do fundo do site atrás da galáxia (cortado como "cover", sem esticar) */
function Ceu() {
  const { scene, size } = useThree();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let vivo = true;
    let t: THREE.Texture | null = null;
    new THREE.TextureLoader().load(asset("/cosmos/fundo.webp"), (x) => {
      t = x;
      if (!vivo) return x.dispose();
      x.colorSpace = THREE.NoColorSpace; // canvas "flat linear": a imagem entra como está
      setTex(x);
    });
    return () => {
      vivo = false;
      t?.dispose();
    };
  }, []);
  useEffect(() => {
    if (!tex) return;
    const img = tex.image as { width: number; height: number };
    const a = size.width / size.height / (img.width / img.height);
    tex.repeat.set(a < 1 ? a : 1, a < 1 ? 1 : 1 / a);
    tex.offset.set((1 - tex.repeat.x) / 2, (1 - tex.repeat.y) / 2);
    scene.background = tex;
    return () => {
      scene.background = null;
    };
  }, [tex, scene, size.width, size.height]);
  return null;
}

export default function ProjectOrbit({ prog, ativo, tier, onPick }: Props) {
  const q: Q = tier === "high" ? "high" : "mid";
  const wrap = useRef<HTMLDivElement>(null);
  const [ativoLoop, setAtivoLoop] = useState(true);
  const [falhou, setFalhou] = useState(false);

  // só desenha enquanto a seção está na tela (e para com o estudo de caso aberto por cima)
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let visivel = true;
    const atualizar = () => setAtivoLoop(visivel && !document.hidden && !document.querySelector("dialog[open]"));
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      atualizar();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", atualizar);
    addEventListener("lp2-modal", atualizar);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", atualizar);
      removeEventListener("lp2-modal", atualizar);
      document.body.style.cursor = ""; // o mouse podia estar em cima de um monólito
    };
  }, []);

  return (
    <div ref={wrap} className="size-full">
      {!falhou && (
        <Canvas
          flat
          linear
          dpr={[1, q === "high" ? 1.5 : 1.25]}
          frameloop={ativoLoop ? "always" : "never"}
          camera={{ fov: 38, near: 0.1, far: 200, position: [0, 1.1, 9.6] }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
          onCreated={({ gl }) => {
            gl.debug.onShaderError = () => setFalhou(true);
            gl.domElement.addEventListener("webglcontextlost", () => setFalhou(true), { once: true });
          }}
        >
          <color attach="background" args={["#02030a"]} />
          <Ceu />
          <ambientLight intensity={0.35} />
          <pointLight position={[-2.6, 0.4, 0.6]} color="#c9d6e8" intensity={18} distance={14} decay={1.6} />
          <directionalLight position={[4, 5, 6]} intensity={0.9} color="#9ec5ff" />
          <Estrelas q={q} dpr={q === "high" ? 1.5 : 1.25} />
          <Singularidade q={q} />
          <Suspense fallback={null}>
            <Orbita prog={prog} ativo={ativo} onPick={onPick} />
          </Suspense>
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.2} radius={0.6} />
          </EffectComposer>
        </Canvas>
      )}
    </div>
  );
}
