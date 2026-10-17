import { COR, NOISE, vec3 } from "./common";

/* Cor do disco pela distância (quente perto do centro) e pelo Doppler:
   o lado que vem na direção da câmera fica mais claro e azulado, o que se afasta, mais avermelhado. */
const TEMPERATURA = /* glsl */ `
vec3 temperatura(float t, float dop) {
  vec3 c = mix(${vec3(COR.goldHi)} * 1.15, ${vec3(COR.gold)}, smoothstep(0.0, 0.32, t));
  c = mix(c, ${vec3(COR.ember)}, smoothstep(0.32, 0.9, t));
  c = mix(c, ${vec3(COR.ice)} * 1.1, max(dop, 0.0) * 0.32 * (1.0 - t));
  c = mix(c, ${vec3(COR.ember)} * 0.8, max(-dop, 0.0) * 0.25);
  return c * (1.0 + 0.65 * dop);
}
`;

/* Gás do disco de acreção: anel plano com faixas que giram mais rápido perto do centro (Kepler) */
export const gasDisk = (octaves: number) => ({
  vertexShader: /* glsl */ `
    varying vec2 vP;
    void main() {
      vP = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #define OCTAVES ${octaves}
    uniform float uPhase;
    uniform float uRin;
    uniform float uRout;
    uniform float uIntensity;
    varying vec2 vP;
    ${NOISE}
    ${TEMPERATURA}
    void main() {
      float r = length(vP);
      float th = atan(vP.y, vP.x);
      float t = clamp((r - uRin) / (uRout - uRin), 0.0, 1.0);
      float w = 1.0 / pow(r, 1.5);
      float a = th - uPhase * 2.2 * w; // mesmo sentido dos fragmentos
      // faixas ao longo das órbitas (alta frequência no raio, baixa no ângulo)
      float n = fbm(vec3(cos(a) * 2.4, sin(a) * 2.4, r * 6.5));
      float streak = 0.25 + 1.0 * smoothstep(0.3, 0.85, n);
      float perfil = smoothstep(uRin - 0.02, uRin + 0.18, r) * pow(1.0 - t, 1.6);
      float dop = -cos(th); // o lado esquerdo vem na direção da câmera
      vec3 col = temperatura(t, dop) * perfil * streak * uIntensity;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});

/* Fragmentos dourados (InstancedMesh): a órbita é calculada aqui, na GPU, a partir da fase acumulada.
   Trocar o formato (ex.: bananas) é só trocar a geometria em SpaceVortexCanvas. */
export const fragments = {
  vertexShader: /* glsl */ `
    attribute vec4 aOrbit; // raio inicial, ângulo inicial, altura (-1..1), escala
    attribute vec4 aSpin;  // eixo de giro (xyz) e velocidade
    uniform float uPhase;
    uniform float uTime;
    uniform float uRin;
    uniform float uRout;
    uniform float uInflow;
    varying vec3 vN;
    varying vec3 vCol;
    varying vec3 vView;
    ${TEMPERATURA}
    mat3 girar(vec3 e, float ang) {
      float s = sin(ang), c = cos(ang), oc = 1.0 - c;
      return mat3(
        oc * e.x * e.x + c, oc * e.x * e.y + e.z * s, oc * e.z * e.x - e.y * s,
        oc * e.x * e.y - e.z * s, oc * e.y * e.y + c, oc * e.y * e.z + e.x * s,
        oc * e.z * e.x + e.y * s, oc * e.y * e.z - e.x * s, oc * e.z * e.z + c);
    }
    void main() {
      float span = uRout - uRin;
      // espiral para dentro: ao chegar no horizonte, renasce na borda
      float r = uRin + mod(aOrbit.x - uRin - uPhase * uInflow, span);
      float w = 1.0 / pow(r, 1.5);
      float ang = aOrbit.y + uPhase * 2.2 * w;
      float h = (0.035 + 0.03 * r) * aOrbit.z + 0.04 * sin(uTime * 0.8 + aOrbit.y * 5.0);
      vec3 c = vec3(cos(ang) * r, h, -sin(ang) * r);
      float s = aOrbit.w * smoothstep(uRout, uRout - 0.9, r) * smoothstep(uRin, uRin + 0.35, r);
      mat3 R = girar(normalize(aSpin.xyz), uTime * aSpin.w + aOrbit.y * 7.0);
      vec3 p = R * (position * s) + c;
      vN = normalize(normalMatrix * (R * normal));
      float t = (r - uRin) / span;
      float dop = -cos(ang);
      vCol = temperatura(t, dop) * (1.05 - 0.55 * t);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vN;
    varying vec3 vCol;
    varying vec3 vView;
    void main() {
      vec3 n = normalize(vN);
      float facet = 0.38 + 0.62 * abs(dot(n, normalize(vec3(-0.3, 0.6, 0.75))));
      float rim = pow(1.0 - abs(dot(n, vView)), 2.0);
      vec3 col = vCol * facet + vCol * rim * 0.9;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/* Anel de fótons + imagem do disco curvada pela gravidade (arco por cima e por baixo da sombra).
   Desenhado num plano que sempre encara a câmera. */
export const photonRing = (octaves: number) => ({
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #define OCTAVES ${octaves}
    uniform float uPhase;
    uniform float uSize;   // lado do plano em raios do horizonte
    uniform float uTilt;   // inclinação aparente do disco (muda a espessura dos arcos)
    uniform float uIntensity;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vec2 p = (vUv - 0.5) * uSize;
      float r = length(p);
      float th = atan(p.y, p.x);
      float fora = smoothstep(0.985, 1.03, r);

      // anel de fótons: fino e muito brilhante
      float anel = exp(-pow((r - 1.05) / 0.02, 2.0)) * 1.25 + exp(-pow((r - 1.07) / 0.1, 2.0)) * 0.3;

      // imagem lenteada do lado de trás do disco: grossa em cima, fina embaixo
      float s = sin(th);
      float esp = mix(0.09, 0.62 * (0.6 + uTilt), smoothstep(0.0, 1.0, abs(s)));
      esp *= s > 0.0 ? 1.0 : 0.45;
      float dentro = r - 1.08;
      float faixa = smoothstep(-0.02, 0.05, dentro) * exp(-max(dentro, 0.0) / max(esp, 0.02) * 1.6);
      float n = fbm(vec3(cos(th - uPhase * 0.6) * 3.0, sin(th - uPhase * 0.6) * 3.0, r * 7.0));
      faixa *= 0.55 + 0.9 * smoothstep(0.25, 0.8, n);

      float dop = 0.72 - 0.38 * cos(th);
      vec3 quente = mix(${vec3(COR.gold)}, ${vec3(COR.goldHi)}, exp(-max(dentro, 0.0) * 6.0));
      vec3 col = (quente * faixa * 0.5 + ${vec3(COR.goldHi)} * anel) * dop * fora * uIntensity;
      // halo largo e suave (o "bloom" de quem não tem pós-processamento)
      col += ${vec3(COR.gold)} * 0.05 * exp(-max(r - 1.0, 0.0) * 1.9) * fora * uIntensity;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
