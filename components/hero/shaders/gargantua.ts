/* =========================================================================
   Buraco negro de Schwarzschild com ray tracing (o mesmo princípio do Gargantua, de Interstellar).

   Para cada pixel, um fóton sai da câmera e a trajetória é integrada passo a passo na métrica de
   Schwarzschild. Em unidades com o raio de Schwarzschild rs = 1, a geodésica da luz equivale a
       x'' = -1,5 · h² · x / r⁵      (h = |x × v|, constante ao longo do caminho)
   Com isso aparecem sozinhos: a sombra (raio crítico ≈ 2,6 rs), o anel de fótons, a imagem do lado
   de trás do disco curvada por cima e por baixo da sombra e o céu do fundo deformado pela lente
   (as galáxias que ficam atrás do buraco negro viram arcos em volta dele).

   O disco de acreção é fino, começa na última órbita estável (ISCO, 3 rs) e tem:
   - temperatura pelo perfil de Novikov–Thorne (cor de corpo negro, de ~4 000 K por fora a ~17 000 K perto do ISCO);
   - efeito Doppler relativístico (o lado que vem na nossa direção fica mais claro e azulado, o outro mais fraco e quente);
   - redshift gravitacional (escurece perto do horizonte);
   - gás turbulento girando com a velocidade de Kepler (mais rápido por dentro), cisalhado em espiral.
   ========================================================================= */

const RUIDO = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < OCTAVES; i++) {
    s += a * vnoise(p);
    p = p * 2.07 + vec3(11.3, 7.1, 3.7);
    a *= 0.5;
  }
  return s;
}
`;

const FISICA = /* glsl */ `
const float R_ISCO = 3.0;    // última órbita circular estável
const float R_OUT = 14.0;    // borda externa do disco
const float R_MIN = 1.55;    // gás que mergulha depois do ISCO (tênue)

uniform float uTime;
uniform float uPhase;
uniform float uDoppler;   // 0 = sem Doppler, 1 = físico
uniform float uExposure;

// cor de um corpo negro na temperatura T (aproximação de Tanner Helland, 0–1)
vec3 corpoNegro(float T) {
  float t = clamp(T, 1000.0, 40000.0) / 100.0;
  float r = t <= 66.0 ? 1.0 : clamp(1.292936 * pow(t - 60.0, -0.1332047), 0.0, 1.0);
  float g = t <= 66.0 ? clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0) : clamp(1.1298909 * pow(t - 60.0, -0.0755148), 0.0, 1.0);
  float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.5432068 * log(t - 10.0) - 1.1962541, 0.0, 1.0));
  return vec3(r, g, b);
}

// gás turbulento: duas camadas defasadas no tempo (flow map), assim a rotação diferencial
// não enrola a textura para sempre. O ângulo ganha um termo em log(r): a turbulência sai
// cisalhada em espiral, como acontece num disco que gira mais rápido por dentro.
float gas(float r, float ang, float omega) {
  const float CICLO = 9.0;
  float t = uPhase;
  float f1 = fract(t / CICLO);
  float f2 = fract(t / CICLO + 0.5);
  float w = 1.0 - abs(2.0 * f1 - 1.0);
  float lr = log(r);
  float a1 = ang - omega * f1 * CICLO * 5.0 + lr * 1.7;
  float a2 = ang - omega * f2 * CICLO * 5.0 + lr * 1.7;
  // baixa frequência no ângulo e alta no raio: faixas ao longo das órbitas
  vec2 c1 = vec2(cos(a1), sin(a1));
  vec2 c2 = vec2(cos(a2), sin(a2));
  float n1 = fbm(vec3(c1 * 1.9, r * 1.35)) * 0.75 + vnoise(vec3(c1 * r * 0.6, 3.1)) * 0.45;
  float n2 = fbm(vec3(c2 * 1.9, r * 1.35 + 17.0)) * 0.75 + vnoise(vec3(c2 * r * 0.6, 9.7)) * 0.45;
  float n = mix(n2, n1, w);
  // filamentos finos e irregulares ao longo das órbitas
  float fino = mix(vnoise(vec3(c2 * 0.8, r * 4.2 + 5.0)), vnoise(vec3(c1 * 0.8, r * 4.2)), w);
  float estria = 0.7 + 0.6 * smoothstep(0.3, 0.8, fino);
  // anéis e falhas em raios diferentes (o disco não é uniforme)
  float aneis = 0.72 + 0.28 * smoothstep(0.25, 0.75, vnoise(vec3(r * 2.6, 0.5, 7.0)));
  return clamp(pow(n, 1.6) * 1.7 * estria * aneis, 0.0, 1.6);
}

// emissão e opacidade do disco onde o fóton cruzou o plano (no referencial do disco)
vec4 disco(vec3 x, vec3 dir) {
  float r = length(x.xz);
  if (r < R_MIN || r > R_OUT) return vec4(0.0);
  // perfil de Novikov–Thorne: fluxo ∝ r⁻³ (1 − √(r_isco / r)), máximo em ~1,36 r_isco
  float rr = max(r, R_ISCO * 1.002);
  float fluxo = pow(R_ISCO / rr, 3.0) * (1.0 - sqrt(R_ISCO / rr)) / 0.0566;
  float mergulho = smoothstep(R_MIN, R_ISCO, r); // dentro do ISCO o gás cai rápido e quase não brilha
  float T = 3000.0 + 14000.0 * pow(max(fluxo, 0.0), 0.25); // gás muito quente: branco-azulado por dentro
  // velocidade orbital local (Kepler em Schwarzschild, rs = 1): v = √(0,5 / (r − 1))
  float v = min(sqrt(0.5 / (max(r, R_MIN) - 1.0)), 0.75);
  vec3 tang = normalize(vec3(-x.z, 0.0, x.x));
  float cosT = dot(tang, -dir);
  float gama = inversesqrt(1.0 - v * v);
  float dop = 1.0 / (gama * (1.0 - v * cosT));
  float grav = sqrt(max(1.0 - 1.0 / r, 0.0));
  float g = mix(1.0, dop, uDoppler) * grav;
  float ang = atan(x.z, x.x);
  float dens = gas(r, ang, v / r);
  dens *= smoothstep(R_OUT, R_OUT * 0.4, r) * mix(0.18, 1.0, mergulho);
  // brilho ∝ g³ (feixe relativístico), com um perfil um pouco mais aberto que o físico para o disco aparecer inteiro
  float brilho = pow(max(fluxo, 0.0), 0.85) * mergulho + 0.1 * (1.0 - mergulho);
  vec3 cor = corpoNegro(T * g) * pow(g, 3.4) * brilho * (0.3 + dens) * 2.3;
  // gradação prateada: tira um pouco da saturação e esfria de leve
  float lum = dot(cor, vec3(0.2126, 0.7152, 0.0722));
  cor = mix(vec3(lum), cor, 0.62) * vec3(0.95, 0.99, 1.06);
  float alfa = clamp(dens * 0.9 + 0.12 * mergulho, 0.0, 0.93);
  // o gás é opaco mesmo onde brilha pouco: a parte da frente do disco esconde o que passa por baixo
  float opaco = clamp(alfa + 0.45 * smoothstep(R_OUT, R_OUT * 0.6, r) * mergulho, 0.0, 0.95);
  return vec4(cor * alfa, opaco);
}

// estrelas nítidas em qualquer resolução (desenhadas na hora, não vêm da textura)
vec3 estrelas(vec3 d, float escala, float limiar, float tw) {
  vec3 p = d * escala;
  vec3 c = floor(p);
  float h = hash13(c);
  if (h < limiar) return vec3(0.0);
  vec3 o = vec3(hash13(c + 1.3), hash13(c + 7.1), hash13(c + 3.7)) - 0.5;
  float dist = length(fract(p) - 0.5 - o * 0.55);
  float forca = pow((h - limiar) / (1.0 - limiar), 2.6);
  float brilho = smoothstep(0.3, 0.0, dist) * (0.25 + 4.0 * forca);
  brilho *= 0.8 + 0.2 * sin(uTime * (1.0 + h * 3.0) + h * 80.0) * tw;
  float k = hash13(c + 5.0);
  vec3 cor = k < 0.55 ? vec3(0.82, 0.88, 1.0) : (k < 0.85 ? vec3(1.0, 0.98, 0.95) : vec3(1.0, 0.86, 0.7));
  return cor * brilho;
}

#ifdef COM_CEU
uniform sampler2D uCeu;   // céu gerado (ferramentas/cosmos.mjs): plano tangente, ±45° em volta de −z
uniform float uCeuMix;    // 0 enquanto a imagem não chegou
uniform mat3 uMundo;      // referencial do disco → mundo
#endif

// fundo: céu de verdade (galáxias, nebulosa) na frente da câmera; no resto, véus suaves
vec3 fundo(vec3 d) {
  float peso = 0.0;
  vec3 col = vec3(0.0);
#ifdef COM_CEU
  vec3 m = uMundo * d;
  float fz = -m.z;
  if (fz > 0.25) {
    vec2 uv = m.xy / fz;
    float borda = max(abs(uv.x), abs(uv.y));
    peso = smoothstep(0.25, 0.5, fz) * smoothstep(1.0, 0.86, borda) * uCeuMix;
    if (peso > 0.0) col = texture2D(uCeu, uv * 0.5 + 0.5).rgb * 0.85 * peso;
  }
#endif
  if (peso < 1.0) {
    float n = fbm(d * 2.3);
    vec3 neb = vec3(0.002, 0.003, 0.009);
    neb += vec3(0.02, 0.03, 0.09) * smoothstep(0.45, 0.95, n);
    neb += vec3(0.035, 0.018, 0.07) * smoothstep(0.62, 1.0, n * fbm(d * 5.2 + 3.0) * 1.7);
    col += neb * (1.0 - peso);
  }
  col += estrelas(d, 220.0, 0.984, 1.0) + estrelas(d, 520.0, 0.991, 0.6) * 0.65 + estrelas(d, 1100.0, 0.994, 0.3) * 0.35;
  return col;
}

// integra o fóton; devolve a cor (pré-multiplicada) e quanto do pixel ficou coberto
vec4 tracar(vec3 pos, vec3 vel, float comFundo) {
  vec3 L = cross(pos, vel);
  float h2 = dot(L, L);
  vec3 cor = vec3(0.0);
  float alfa = 0.0;
  bool escapou = false;
  for (int i = 0; i < STEPS; i++) {
    float r = length(pos);
    if (r < 1.0) break; // passou do horizonte de eventos
    // passos curtos perto do buraco negro, longos longe dele
    float dt = clamp(0.1 * (r - 0.92), 0.018, 2.4);
    // brilho difuso acima e abaixo do disco (o disco não é infinitamente fino)
    float rp = length(pos.xz);
    if (abs(pos.y) < 1.2 && rp < R_OUT && rp > R_MIN) {
      float esp = 0.12 + 0.05 * rp;
      float perfil = smoothstep(R_MIN, R_ISCO, rp) * smoothstep(R_OUT, 4.0, rp) * pow(R_ISCO / max(rp, R_ISCO), 1.6);
      cor += (1.0 - alfa) * vec3(0.72, 0.82, 1.0) * exp(-abs(pos.y) / esp) * perfil * dt * 0.04;
    }
    vec3 a0 = -1.5 * h2 * pos / pow(r, 5.0);
    vec3 np = pos + vel * dt + 0.5 * a0 * dt * dt;
    float nr = length(np);
    vec3 a1 = -1.5 * h2 * np / pow(nr, 5.0);
    vec3 nv = vel + 0.5 * (a0 + a1) * dt;
    if (pos.y * np.y < 0.0) {
      float t = pos.y / (pos.y - np.y);
      vec4 e = disco(mix(pos, np, t), normalize(mix(vel, nv, t)));
      cor += (1.0 - alfa) * e.rgb;
      alfa += (1.0 - alfa) * e.a;
      if (alfa > 0.985) break;
    }
    pos = np;
    vel = nv;
    if (nr > 80.0 && dot(pos, vel) > 0.0) {
      escapou = true;
      break;
    }
  }
  float cobertura = escapou ? alfa : 1.0; // o que não escapou caiu no buraco (preto)
  if (escapou && comFundo > 0.5) cor += (1.0 - alfa) * fundo(normalize(vel));
  return vec4(cor, comFundo > 0.5 ? 1.0 : cobertura);
}

vec3 revelar(vec3 c) {
  // curva de filme: segura os brilhos do disco sem estourar
  c = vec3(1.0) - exp(-c * uExposure);
  return pow(c, vec3(0.95));
}
`;

/** Hero: triângulo que cobre a tela; a câmera do three.js define o raio de cada pixel */
export const gargantuaTela = (passos: number, oitavas: number) => ({
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #define STEPS ${passos}
    #define OCTAVES ${oitavas}
    #define COM_CEU
    uniform vec3 uCamPos;
    uniform mat4 uCamWorld;
    uniform mat4 uProjInv;
    uniform mat3 uDisco; // mundo → referencial do disco (inclinação)
    varying vec2 vUv;
    ${RUIDO}
    ${FISICA}
    void main() {
      vec4 v = uProjInv * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
      vec3 rd = normalize((uCamWorld * vec4(v.xyz / v.w, 0.0)).xyz);
      vec4 res = tracar(uDisco * uCamPos, uDisco * rd, 1.0);
      gl_FragColor = vec4(revelar(res.rgb), 1.0);
    }
  `,
});

/** Galáxia de projetos: o mesmo buraco negro num plano, com câmera virtual fixa e fundo transparente */
export const gargantuaSprite = (passos: number, oitavas: number) => ({
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #define STEPS ${passos}
    #define OCTAVES ${oitavas}
    uniform vec3 uOlho;    // posição da câmera virtual
    uniform float uAbertura; // tangente da metade do campo de visão
    varying vec2 vUv;
    ${RUIDO}
    ${FISICA}
    void main() {
      vec3 frente = normalize(-uOlho);
      vec3 dir = normalize(cross(frente, vec3(0.0, 1.0, 0.0)));
      vec3 cima = cross(dir, frente);
      vec2 p = (vUv * 2.0 - 1.0) * uAbertura;
      vec3 rd = normalize(frente + p.x * dir + p.y * cima);
      vec4 res = tracar(uOlho, rd, 0.0);
      // borda do plano some suave (o disco não termina num corte reto)
      float borda = smoothstep(1.0, 0.82, max(abs(vUv.x * 2.0 - 1.0), abs(vUv.y * 2.0 - 1.0)));
      gl_FragColor = vec4(revelar(res.rgb) * borda, res.a * borda);
    }
  `,
});
