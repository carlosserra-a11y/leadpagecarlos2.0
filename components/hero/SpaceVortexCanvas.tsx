"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { rendererSoftware, type Tier } from "@/lib/useDeviceTier";
import { QUALIDADE, damp, ease, type Q } from "@/components/three/partes";
import { heroState } from "./heroState";
import { RAIO_SOMBRA, gargantuaTela } from "./shaders/gargantua";

const INCLINACAO = 0.035; // o disco quase de lado, como no Gargantua
const GIRO = -0.1; // leve diagonal na composição

/* ---------------- o buraco negro: um triângulo que cobre a tela e roda o ray tracer ---------------- */
function Gargantua({ q }: { q: Q }) {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    return g;
  }, []);
  const mat = useMemo(() => {
    const { passos, oitavas } = QUALIDADE[q];
    return new THREE.ShaderMaterial({
      ...gargantuaTela(passos, oitavas),
      uniforms: {
        uCamPos: { value: new THREE.Vector3() },
        uCamWorld: { value: new THREE.Matrix4() },
        uProjInv: { value: new THREE.Matrix4() },
        uDisco: { value: new THREE.Matrix3() },
        uTime: { value: 0 },
        uPhase: { value: 0 },
        uDoppler: { value: 0.72 },
        uExposure: { value: 1.22 },
      },
      depthTest: false,
      depthWrite: false,
    });
  }, [q]);
  const rot = useMemo(() => new THREE.Matrix4(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const tilt = useRef({ x: INCLINACAO, z: GIRO });
  const vel = useRef(1);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const alvo = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const p = heroState.p;
    const e = ease(p);
    const u = mat.uniforms;

    // o gás gira mais rápido conforme a câmera se aproxima
    vel.current = damp(vel.current, 1 + 2.2 * e, 4, dt);
    u.uPhase.value += dt * vel.current;
    u.uTime.value += dt;

    // câmera: parallax do mouse + dolly em direção ao horizonte (a ~31 rs de distância)
    const longe = size.width / size.height < 0.8 ? 54 : 31;
    alvo.set(heroState.px * 3.2, 2.8 - heroState.py * 1.6, THREE.MathUtils.lerp(longe, 6.2, e));
    cam.position.x = damp(cam.position.x, alvo.x, 3, dt);
    cam.position.y = damp(cam.position.y, alvo.y, 3, dt);
    cam.position.z = damp(cam.position.z, alvo.z, 6, dt);
    cam.lookAt(0, 0, 0);
    const fov = 40 + 18 * e;
    if (Math.abs(cam.fov - fov) > 0.01) cam.fov = fov;
    // o buraco negro fica na altura definida pelo CSS (--bh-y), não no meio da tela
    cam.setViewOffset(size.width, size.height, 0, size.height * (0.5 - heroState.bhY), size.width, size.height);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    // o disco responde de leve ao mouse
    tilt.current.x = damp(tilt.current.x, INCLINACAO + heroState.py * 0.025, 2.5, dt);
    tilt.current.z = damp(tilt.current.z, GIRO - heroState.px * 0.03, 2.5, dt);
    euler.set(tilt.current.x, 0, tilt.current.z);
    rot.makeRotationFromEuler(euler).transpose(); // mundo → disco
    u.uDisco.value.setFromMatrix4(rot);
    u.uCamPos.value.copy(cam.position);
    u.uCamWorld.value.copy(cam.matrixWorld);
    u.uProjInv.value.copy(cam.projectionMatrixInverse);

    // anel gótico: acompanha o centro e o tamanho real da sombra na tela
    const ring = heroState.ring;
    if (ring) {
      proj.set(0, 0, 0).project(cam);
      const d = cam.position.length();
      const ang = Math.asin(Math.min(0.99, RAIO_SOMBRA / d));
      const sombraPx = (Math.tan(ang) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) * (size.height / 2);
      const cx = (proj.x * 0.5 + 0.5) * size.width;
      const cy = (1 - (proj.y * 0.5 + 0.5)) * size.height;
      const s = Math.min(sombraPx * 2.25, size.width * 0.46) / 245;
      ring.style.transform = `translate3d(${(cx - size.width / 2).toFixed(1)}px, ${(cy - size.height * heroState.bhY).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      ring.style.opacity = String(1 - Math.min(1, Math.max(0, (p - 0.08) / 0.35)));
    }
  });

  return (
    <mesh geometry={geo} frustumCulled={false} renderOrder={-10}>
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* ---------------- monitor de FPS ---------------- */
function Vigia({ onLento, onPronto, ligado }: { onLento: (mediana: number) => void; onPronto: () => void; ligado: boolean }) {
  const amostras = useRef<number[]>([]);
  const quadros = useRef(0);
  const avisou = useRef(false);
  useFrame((_, dt) => {
    quadros.current++;
    if (quadros.current === 3 && !avisou.current) {
      avisou.current = true;
      onPronto();
    }
    if (!ligado || quadros.current < 40) return; // ignora o aquecimento (compilação do shader)
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

function Cena({ q, onLento, onPronto, vigia }: { q: Q; onLento: (mediana: number) => void; onPronto: () => void; vigia: boolean }) {
  return (
    <>
      <Gargantua q={q} />
      <Vigia onLento={onLento} onPronto={onPronto} ligado={vigia} />
      {q !== "low" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={q === "high" ? 0.6 : 0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} radius={0.78} />
        </EffectComposer>
      )}
    </>
  );
}

export default function SpaceVortexCanvas({ tier, trackRef, onPronto }: { tier: Exclude<Tier, "off">; trackRef: RefObject<HTMLElement | null>; onPronto: () => void }) {
  const [q, setQ] = useState<Q>(tier);
  const [ativo, setAtivo] = useState(true);
  const [falhou, setFalhou] = useState(false);
  // ?vigia=0 desliga a troca automática de qualidade e ?escala=1.2 muda a resolução
  // (usados pela ferramenta que gera o pôster, com WebGL por software)
  const [params] = useState(() => new URLSearchParams(location.search));
  const vigia = params.get("vigia") !== "0";
  const escalaForcada = Number(params.get("escala")) || 0;

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

  // o ray tracer roda abaixo da resolução da tela (é um brilho suave; o texto fica nítido no HTML)
  const dpr = escalaForcada || Math.min(window.devicePixelRatio || 1, 1.5) * QUALIDADE[q].escala;

  return (
    <Canvas
      flat
      linear
      dpr={dpr}
      frameloop={ativo ? "always" : "never"}
      camera={{ fov: 40, near: 0.1, far: 400, position: [0, 2.8, 31] }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false, depth: false }}
      onCreated={({ gl }) => {
        // shader que não compila ou contexto perdido: fica o pôster
        gl.debug.onShaderError = () => setFalhou(true);
        gl.domElement.addEventListener("webglcontextlost", () => setFalhou(true), { once: true });
        // sem placa de vídeo, começa no nível mais leve
        if (vigia && rendererSoftware(gl.getContext())) setQ("low");
      }}
    >
      <Cena
        q={q}
        vigia={vigia}
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
