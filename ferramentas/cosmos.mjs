/* Gera as imagens do espaço com um shader (WebGL2 no Chromium; roda sem placa de vídeo, só demora mais):
   - public/cosmos/ceu-2048.webp e ceu-1024.webp: o céu atrás do buraco negro, em projeção plana (±45°),
     com nebulosa, galáxias e campo profundo. As estrelas o shader do hero desenha na hora (ficam nítidas).
   - public/cosmos/fundo.webp e fundo-mob.webp: o campo profundo do fundo do site.
   - public/cosmos/estrelas-1.webp e estrelas-2.webp: camadas de estrelas que se repetem sem emenda (parallax).
   - public/cosmos/galaxia-N.webp: galáxias soltas, em camadas de profundidade.
   Uso: cd ferramentas && node cosmos.mjs [previa]   ("previa" grava versões pequenas na pasta indicada por PREVIA) */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const PREVIA = process.argv[2] === "previa";
const DESTINO = PREVIA ? new URL(`file://${process.env.PREVIA || "/tmp"}/`) : new URL("../public/cosmos/", import.meta.url);
await mkdir(DESTINO, { recursive: true });

/* ------------------------------------------------------------------------------------------------
   Shader
   ------------------------------------------------------------------------------------------------ */
const FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uRes;          // tamanho da imagem em pixels (com a superamostragem)
uniform float uEscala;      // pixels da imagem final por pixel renderizado (superamostragem)
uniform int uModo;          // 0 céu do buraco negro · 1 fundo do site · 2 galáxia solta · 3 estrelas em mosaico
uniform float uSemente;
uniform float uExpo;

// galáxias: posição (x, y, raio, ligada) · tipo/inclinação/ângulo/braços · passo/bojo/barra/semente · tinta
uniform vec4 uGP[8];
uniform vec4 uG0[8];
uniform vec4 uG1[8];
uniform vec3 uGT[8];
uniform int uNG;

// estrelas fortes com raios de difração (modo 3), em pixels do mosaico: x, y, brilho, temperatura
uniform vec4 uBri[12];
uniform int uNB;
uniform float uDens;        // modo 3: chance de estrela por célula
uniform float uCel;         // modo 3: tamanho da célula em pixels
uniform float uLum;         // modo 3: brilho geral

out vec4 saida;

/* ---------------- ruído ---------------- */
float h12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 h22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
vec2 grad(vec2 i) {
  float a = h12(i) * 6.2831853;
  return vec2(cos(a), sin(a));
}
// ruído de gradiente, 0–1
float gn(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad(i), f);
  float b = dot(grad(i + vec2(1, 0)), f - vec2(1, 0));
  float c = dot(grad(i + vec2(0, 1)), f - vec2(0, 1));
  float d = dot(grad(i + vec2(1, 1)), f - vec2(1, 1));
  return clamp(0.5 + 0.75 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y), 0.0, 1.0);
}
float fbm(vec2 p, int oct) {
  float s = 0.0, a = 0.5, n = 0.0;
  mat2 R = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 9; i++) {
    if (i >= oct) break;
    s += a * gn(p);
    n += a;
    p = R * p * 2.03 + 17.13;
    a *= 0.5;
  }
  return s / n;
}
float cume(vec2 p, int oct) { // filamentos (ruído de crista)
  float s = 0.0, a = 0.5, n = 0.0;
  mat2 R = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 8; i++) {
    if (i >= oct) break;
    s += a * (1.0 - abs(2.0 * gn(p) - 1.0));
    n += a;
    p = R * p * 2.1 + 9.7;
    a *= 0.5;
  }
  return s / n;
}

/* cor de corpo negro (Tanner Helland), devolve cromaticidade 0–1 */
vec3 corpoNegro(float T) {
  float t = clamp(T, 1000.0, 40000.0) / 100.0;
  float r = t <= 66.0 ? 1.0 : clamp(1.292936 * pow(t - 60.0, -0.1332047), 0.0, 1.0);
  float g = t <= 66.0 ? clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0) : clamp(1.1298909 * pow(t - 60.0, -0.0755148), 0.0, 1.0);
  float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.5432068 * log(t - 10.0) - 1.1962541, 0.0, 1.0));
  return vec3(r, g, b);
}

/* ---------------- galáxia ----------------
   p: coordenadas no céu divididas pelo raio visível (1 = borda).
   g0 = tipo (0 espiral, 1 barrada, 2 elíptica), inclinação (rad), ângulo de posição (rad), braços
   g1 = passo da espiral (rad), raio do bojo, barra (ou achatamento da elíptica), semente */
vec3 galaxia(vec2 p, vec4 g0, vec4 g1, vec3 tinta) {
  float tipo = g0.x, inc = g0.y, pa = g0.z, bracos = g0.w;
  float passo = g1.x, bojo = g1.y, barra = g1.z, sem = g1.w;
  float c = cos(pa), s = sin(pa);
  p = mat2(c, s, -s, c) * p;
  if (dot(p, p) > 2.6) return vec3(0.0);

  if (tipo > 1.5) {
    // elíptica: perfil de de Vaucouleurs, estrelas velhas (amareladas), halo longo
    vec2 e = vec2(p.x, p.y / mix(1.0, 0.42, barra));
    float rr = length(e) + 1e-4;
    float I = exp(-7.67 * (pow(rr / bojo, 0.25) - 1.0));
    I *= smoothstep(1.35, 0.4, rr);
    // aglomerados globulares em volta
    vec2 gc = floor(p * 22.0);
    float gl = 0.0;
    if (h12(gc + sem) > 0.975) {
      vec2 o = (gc + h22(gc + sem)) / 22.0;
      gl = exp(-dot(p - o, p - o) * 60000.0) * smoothstep(1.0, 0.25, length(o)) * 0.02;
    }
    return vec3(1.0, 0.84, 0.66) * (I * 0.02 + gl);
  }

  float ci = max(cos(inc), 0.045);
  vec2 q = vec2(p.x, p.y / ci); // no plano do disco
  float r = length(q) + 1e-4;
  float th = atan(q.y, q.x);

  // bojo: esferoide pouco achatado
  vec2 qb = vec2(p.x, p.y / mix(1.0, ci, 0.3));
  float rb = length(qb) + 1e-4;
  float Ib = exp(-7.67 * (pow(rb / bojo, 0.25) - 1.0));

  // disco exponencial
  float hR = 0.25;
  float Id = exp(-r / hR) * smoothstep(1.3, 0.75, r);

  // barra
  float Ibar = 0.0;
  float rIni = 0.07;
  if (tipo > 0.5) {
    float L = 0.3 * barra;
    Ibar = exp(-pow(abs(q.x) / L, 3.0) - pow(q.y / (0.055 + 0.02 * barra), 2.0));
    rIni = L * 0.95;
  }

  // braços em espiral logarítmica, com o traçado deformado por ruído
  float w = fbm(q * 2.6 + sem, 4) - 0.5;
  float w2 = fbm(q * 7.0 + sem * 1.7, 4) - 0.5;
  float fase = bracos * (th - log(r / rIni) / tan(passo)) + w * 3.4 + w2 * 1.2;
  float braco = pow(0.5 + 0.5 * cos(fase), 3.0);
  // esporas: braços secundários finos entre os principais
  braco += pow(0.5 + 0.5 * cos(fase * 2.0 + w2 * 5.0 + 1.3), 6.0) * 0.35;
  float zona = smoothstep(rIni * 0.7, rIni * 1.6, r) * smoothstep(1.2, 0.5, r);
  float grumos = fbm(q * 11.0 + sem * 2.0, 5);
  float Iarm = Id * braco * zona * (0.25 + 2.2 * grumos * grumos);
  // floco: galáxias com muitos braços curtos
  float floco = smoothstep(2.5, 4.0, bracos);
  Iarm = mix(Iarm, Id * zona * pow(fbm(vec2(th * 3.0, log(r) * 9.0) + sem, 5), 2.0) * 2.4, floco * 0.6);

  // aglomerados jovens (pontos azuis) e regiões HII (rosadas), concentrados nos braços
  float jov = 0.0, hii = 0.0;
  for (int k = 0; k < 2; k++) {
    float esc = k == 0 ? 64.0 : 150.0;
    vec2 gq = q * esc;
    vec2 gc = floor(gq);
    float hh = h12(gc + sem * 7.0 + float(k) * 13.0);
    vec2 o = gc + 0.25 + 0.5 * h22(gc + sem + float(k) * 5.0);
    float pt = exp(-dot(gq - o, gq - o) * (k == 0 ? 9.0 : 14.0));
    jov += pt * smoothstep(0.5, 1.0, hh) * (k == 0 ? 1.0 : 0.6);
    hii += pt * step(0.93, hh) * (k == 0 ? 1.0 : 0.0);
  }
  float aglo = fbm(q * 5.0 + sem * 4.0, 3); // os aglomerados aparecem em grupos
  jov *= braco * zona * smoothstep(0.35, 0.65, aglo) * 1.6;
  hii *= braco * zona * 1.4;

  // poeira na borda de dentro dos braços (tira mais azul que vermelho)
  float pB = pow(0.5 + 0.5 * cos(fase + 0.75), 8.0) * zona;
  float tau = pB * 3.6 * pow(fbm(q * 18.0 + sem * 3.0, 5) + 0.25, 2.0) * smoothstep(0.02, 0.14, r) * exp(-r / 0.6);
  // de lado: faixa escura no plano do disco
  float lado = smoothstep(1.15, 1.48, inc);
  if (lado > 0.0) {
    float zz = p.y + 0.012 * (fbm(vec2(p.x * 6.0, sem), 3) - 0.5);
    float esp = 0.012 + 0.012 * fbm(vec2(p.x * 14.0, sem + 3.0), 3);
    float faixa = exp(-pow(zz / esp, 2.0)) * smoothstep(1.0, 0.25, abs(p.x));
    tau += lado * faixa * 4.5 * (0.55 + 0.9 * fbm(p * vec2(26.0, 70.0) + sem, 4));
  }
  // disco grosso (aparece quando a galáxia está de lado)
  float Igr = exp(-abs(p.x) / (hR * 1.2)) * exp(-abs(p.y) / 0.035) * lado;

  vec3 corDisco = mix(vec3(1.0, 0.93, 0.84), tinta, 0.72);
  vec3 col = vec3(1.0, 0.8, 0.56) * Ib * 0.05
           + corDisco * (Id * 0.14 + Iarm * 0.8 + Igr * 0.5)
           + vec3(1.0, 0.86, 0.66) * Ibar * Id * 1.6
           + vec3(0.6, 0.75, 1.0) * jov * Id * 2.6
           + vec3(1.0, 0.34, 0.56) * hii * Id * 2.0;
  // halo difuso em volta
  col += vec3(0.8, 0.84, 1.0) * exp(-length(p) / 0.45) * 0.012;
  col *= exp(-tau * vec3(0.78, 0.9, 1.0));
  return col * 0.3;
}

/* ---------------- nebulosa: azul profundo, índigo e violeta (o "poder cósmico") ---------------- */
vec3 nebulosa(vec2 p, float forca) {
  vec2 q = vec2(fbm(p + 3.1, 5), fbm(p + vec2(7.7, 1.3), 5));
  vec2 w = p + 1.7 * (q - 0.5);
  float n = fbm(w * 1.3, 7);
  float m = fbm(w * 0.6 + 11.0, 5);
  float gas = smoothstep(0.5, 0.86, n);
  float fil = pow(cume(w * 2.3 + 5.0, 6), 4.0);
  vec3 indigo = vec3(0.12, 0.17, 0.55);
  vec3 violeta = vec3(0.36, 0.16, 0.56);
  vec3 ciano = vec3(0.06, 0.34, 0.52);
  vec3 c = mix(indigo, violeta, smoothstep(0.4, 0.72, m));
  c = mix(c, ciano, smoothstep(0.52, 0.78, fbm(w * 0.8 + 23.0, 4)) * 0.7);
  vec3 e = c * gas * gas * 0.07 + vec3(0.42, 0.56, 1.0) * fil * gas * 0.06;
  // nuvens escuras de poeira
  float po = smoothstep(0.52, 0.78, fbm(w * 2.4 + 41.0, 6));
  e *= 1.0 - 0.9 * po;
  // luz difusa de estrelas não resolvidas
  e += vec3(0.5, 0.56, 0.7) * pow(fbm(w * 0.9 + 77.0, 4), 3.0) * 0.012;
  return e * forca;
}

/* ---------------- campo profundo: milhares de galáxias pequenas e distantes ---------------- */
vec3 campoProfundo(vec2 px, float cel, float dens, float semente) {
  vec3 acc = vec3(0.0);
  vec2 c0 = floor(px / cel);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = c0 + vec2(i, j) + semente * 17.0;
      float h = h12(c + 0.37);
      if (h > dens) continue;
      vec2 centro = (c - semente * 17.0 + h22(c)) * cel;
      float tam = mix(1.0, 13.0, pow(h12(c + 1.9), 6.0)); // quase todas minúsculas
      vec2 d = px - centro;
      if (dot(d, d) > tam * tam * 9.0) continue;
      float ang = h12(c + 2.7) * 6.2832;
      float inc = acos(mix(0.12, 1.0, h12(c + 3.3)));
      float tipo = h12(c + 4.1);
      float z = h12(c + 5.5); // distância: as mais longe ficam mais vermelhas e fracas
      vec3 tinta = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.72, 0.5), z);
      vec3 g;
      if (tam > 4.0) {
        vec4 g0 = vec4(tipo < 0.25 ? 2.0 : (tipo < 0.45 ? 1.0 : 0.0), inc, ang, tipo < 0.8 ? 2.0 : 3.0);
        vec4 g1 = vec4(mix(0.25, 0.45, h12(c + 6.1)), mix(0.05, 0.14, h12(c + 6.7)), mix(0.3, 0.9, h12(c + 7.3)), h12(c + 8.1) * 50.0);
        g = galaxia(d / tam, g0, g1, tinta) * 22.0;
      } else {
        float e = cos(inc);
        mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
        vec2 q = R * d;
        q.y /= max(e, 0.25);
        float rr = length(q) / tam;
        g = tinta * (exp(-rr * rr * 3.0) * 0.9 + exp(-rr * 1.6) * 0.25) * 0.18;
      }
      acc += g * mix(0.7, 0.18, z);
    }
  }
  return acc;
}

/* ---------------- estrelas (PSF gaussiana + halo), em pixels ---------------- */
vec3 estrela(vec2 d, float brilho, float T, float raios) {
  float r2 = dot(d, d);
  float sig = 0.62 * uEscala;
  float nucleo = exp(-r2 / (2.0 * sig * sig));
  float halo = brilho > 0.5 ? exp(-sqrt(r2) / (1.8 * uEscala)) * 0.06 + exp(-sqrt(r2) / (9.0 * uEscala)) * 0.012 : 0.0;
  float esp = 0.0;
  if (raios > 0.0) {
    // raios de difração em cruz (como nas fotos do Hubble), afinando com a distância
    vec2 a = abs(d) / uEscala;
    float L = 26.0 * raios;
    esp = (exp(-a.y * a.y / 0.35) * exp(-a.x / L) + exp(-a.x * a.x / 0.35) * exp(-a.y / L)) * 0.35;
    // segundo par, mais fraco, em diagonal
    vec2 b = abs(mat2(0.7071, -0.7071, 0.7071, 0.7071) * d) / uEscala;
    esp += (exp(-b.y * b.y / 0.3) * exp(-b.x / (L * 0.35)) + exp(-b.x * b.x / 0.3) * exp(-b.y / (L * 0.35))) * 0.08;
  }
  vec3 cor = mix(vec3(1.0), corpoNegro(T), 0.75);
  return cor * brilho * (nucleo + halo + esp * brilho * 0.5);
}

// camada de estrelas; com 'periodo' > 0 as células se repetem (mosaico sem emenda)
vec3 campoEstrelas(vec2 px, float cel, float dens, float lum, float semente, vec2 periodo) {
  vec3 acc = vec3(0.0);
  vec2 c0 = floor(px / cel);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = c0 + vec2(i, j);
      vec2 cw = periodo.x > 0.0 ? mod(c, periodo) : c;
      vec2 k = cw + semente * 31.0;
      float h = h12(k + 0.11);
      if (h > dens) continue;
      vec2 centro = (c + 0.1 + 0.8 * h22(k)) * cel;
      // magnitudes: muitas fracas, poucas fortes
      float m = pow(h12(k + 2.3), 7.0);
      float brilho = lum * (0.02 + 2.0 * m);
      // temperaturas: a maioria branca/amarelada, algumas azuis e laranja
      float tt = h12(k + 4.7);
      float T = tt < 0.12 ? mix(2800.0, 4200.0, tt / 0.12) : (tt < 0.8 ? mix(4800.0, 7500.0, (tt - 0.12) / 0.68) : mix(9000.0, 22000.0, (tt - 0.8) / 0.2));
      acc += estrela(px - centro, brilho, T, 0.0);
    }
  }
  return acc;
}

/* ---------------- revelação: curva asinh (como em astrofotografia) + sRGB ---------------- */
vec3 revelar(vec3 c) {
  c *= uExpo;
  vec3 a = log(c * 40.0 + sqrt(c * c * 1600.0 + 1.0)) / log(40.0 + sqrt(1601.0));
  a = clamp(a, 0.0, 1.0);
  return pow(a, vec3(1.0 / 1.12));
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 col = vec3(0.0);
  float alfa = 1.0;

  if (uModo == 0) {
    // céu do buraco negro: plano tangente, x e y de -1 a 1 (±45°)
    vec2 uv = (px / uRes) * 2.0 - 1.0;
    uv.y = -uv.y;
    col += nebulosa(uv * 2.2 + uSemente, 0.55);
    col += campoProfundo(px / uEscala, 46.0, 0.42, uSemente) * 0.8;
    for (int i = 0; i < 8; i++) {
      if (i >= uNG) break;
      vec2 d = (uv - uGP[i].xy) / uGP[i].z;
      col += galaxia(d, uG0[i], uG1[i], uGT[i]) * uGP[i].w;
    }
    col += vec3(0.0006, 0.0008, 0.0018);
  } else if (uModo == 1) {
    // fundo do site
    vec2 uv = px / uRes.y;
    col += nebulosa(uv * 2.6 + uSemente, 1.0);
    col += campoProfundo(px / uEscala, 40.0, 0.5, uSemente) * 0.75;
    col += campoEstrelas(px, 7.0 * uEscala, 0.14, 0.2, uSemente + 3.0, vec2(0.0));
    for (int i = 0; i < 8; i++) {
      if (i >= uNG) break;
      vec2 d = (px / uRes.y - uGP[i].xy) / uGP[i].z;
      col += galaxia(d, uG0[i], uG1[i], uGT[i]) * uGP[i].w;
    }
    col += vec3(0.0006, 0.0008, 0.0018);
  } else if (uModo == 2) {
    // galáxia solta, no centro, fundo preto (entra na página em modo "screen")
    vec2 d = (px / uRes - 0.5) * 2.0 * 0.95;
    d.y = -d.y;
    col = galaxia(d, uG0[0], uG1[0], uGT[0]);
    col *= smoothstep(0.95, 0.75, max(abs(d.x), abs(d.y)));
  } else {
    // estrelas em mosaico (transparente, com raios nas mais fortes)
    vec2 periodo = floor(uRes / uCel + 0.5);
    col = campoEstrelas(px, uCel, uDens, uLum, uSemente, periodo);
    for (int i = 0; i < 12; i++) {
      if (i >= uNB) break;
      vec2 d = px - uBri[i].xy;
      d = d - uRes * floor(d / uRes + 0.5); // distância com volta (sem emenda)
      col += estrela(d, uBri[i].z, uBri[i].w, 1.0);
    }
  }

  vec3 v = revelar(col);
  if (uModo == 3) {
    alfa = max(max(v.r, v.g), v.b);
    v = alfa > 0.0 ? v / alfa : vec3(0.0);
  }
  saida = vec4(v, alfa);
}
`;

/* ------------------------------------------------------------------------------------------------
   Renderização em blocos (o WebGL por software não gosta de um desenho só, muito longo)
   ------------------------------------------------------------------------------------------------ */
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.setDefaultTimeout(0);
await page.setContent("<canvas id=c></canvas>");

async function render({ w, h, ss = 1, modo, semente = 0, expo = 1, galaxias = [], brilhantes = [], dens = 0, cel = 0, lum = 0 }) {
  const W = w * ss;
  const H = h * ss;
  const t0 = Date.now();
  const png = await page.evaluate(
    async ({ FRAG, W, H, ss, modo, semente, expo, galaxias, brilhantes, dens, cel, lum }) => {
      const cv = document.getElementById("c");
      cv.width = W;
      cv.height = H;
      const gl = cv.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
      const sh = (tipo, src) => {
        const s = gl.createShader(tipo);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, "#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      gl.viewport(0, 0, W, H); // o contexto é reaproveitado entre imagens de tamanhos diferentes
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const U = (n) => gl.getUniformLocation(prog, n);
      gl.uniform2f(U("uRes"), W, H);
      gl.uniform1f(U("uEscala"), ss);
      gl.uniform1i(U("uModo"), modo);
      gl.uniform1f(U("uSemente"), semente);
      gl.uniform1f(U("uExpo"), expo);
      gl.uniform1f(U("uDens"), dens);
      gl.uniform1f(U("uCel"), cel * ss);
      gl.uniform1f(U("uLum"), lum);
      const pad = (arr, n) => [...arr, ...Array(Math.max(0, n * 4 - arr.length)).fill(0)];
      gl.uniform1i(U("uNG"), galaxias.length);
      gl.uniform4fv(U("uGP"), pad(galaxias.flatMap((g) => g.pos), 8));
      gl.uniform4fv(U("uG0"), pad(galaxias.flatMap((g) => g.g0), 8));
      gl.uniform4fv(U("uG1"), pad(galaxias.flatMap((g) => g.g1), 8));
      gl.uniform3fv(U("uGT"), [...galaxias.flatMap((g) => g.tinta), ...Array((8 - galaxias.length) * 3).fill(0)]);
      gl.uniform1i(U("uNB"), brilhantes.length);
      gl.uniform4fv(U("uBri"), pad(brilhantes.flatMap((b) => [b[0] * ss, b[1] * ss, b[2], b[3]]), 12));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
      const T = 256;
      for (let y = 0; y < H; y += T) {
        for (let x = 0; x < W; x += T) {
          gl.scissor(x, y, T, T);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          gl.finish();
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      return cv.toDataURL("image/png");
    },
    { FRAG, W, H, ss, modo, semente, expo, galaxias, brilhantes, dens, cel, lum },
  );
  const buf = Buffer.from(png.split(",")[1], "base64");
  console.log(`  ${w}×${h} (×${ss}) em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  // superamostragem: reduz com Lanczos (bordas e estrelas limpas)
  return ss > 1 ? sharp(buf).resize(w, h, { kernel: "lanczos3" }).toBuffer() : buf;
}

const salvar = async (buf, nome, formatos) => {
  for (const [ext, opts] of formatos) {
    const s = sharp(buf);
    const arq = new URL(`${nome}.${ext}`, DESTINO).pathname;
    if (ext === "webp") await s.webp(opts).toFile(arq);
    else if (ext === "avif") await s.avif(opts).toFile(arq);
    else await s.png(opts).toFile(arq);
    console.log(`  → ${nome}.${ext}`);
  }
};

/* ------------------------------------------------------------------------------------------------
   O que gerar
   ------------------------------------------------------------------------------------------------ */
const G = (pos, tipo, inc, pa, bracos, passo, bojo, barra, sem, tinta) => ({ pos, g0: [tipo, inc, pa, bracos], g1: [passo, bojo, barra, sem], tinta });

// galáxias soltas do fundo do site (camadas de parallax)
const SOLTAS = [
  ["galaxia-1", G([0, 0, 1, 1], 0, 0.45, 0.4, 2, 0.3, 0.075, 0, 3.1, [0.7, 0.82, 1.0])], // espiral de frente (tipo M51)
  ["galaxia-2", G([0, 0, 1, 1], 1, 0.62, -0.5, 2, 0.4, 0.07, 0.95, 7.9, [0.78, 0.86, 1.0])], // barrada (tipo NGC 1300)
  ["galaxia-3", G([0, 0, 1, 1], 0, 1.52, 0.18, 2, 0.3, 0.2, 0, 12.4, [0.9, 0.9, 1.0])], // de lado (tipo Sombrero)
  ["galaxia-4", G([0, 0, 1, 1], 0, 1.22, -0.35, 2, 0.24, 0.1, 0, 21.7, [0.8, 0.86, 1.0])], // inclinada (tipo Andrômeda)
  ["galaxia-5", G([0, 0, 1, 1], 2, 0, 0.6, 0, 0, 0.22, 0.35, 5.3, [1, 1, 1])], // elíptica
  ["galaxia-6", G([0, 0, 1, 1], 0, 0.85, 1.1, 4, 0.42, 0.06, 0, 33.3, [0.66, 0.8, 1.0])], // floco, muitos braços
];

// céu do buraco negro: galáxias nas laterais e uma quase atrás dele (a lente vira arcos)
const CEU = [
  G([-0.42, 0.24, 0.16, 1], 0, 0.55, 0.5, 2, 0.3, 0.07, 0, 3.1, [0.7, 0.82, 1.0]),
  G([0.5, 0.3, 0.11, 1], 0, 1.35, -0.6, 2, 0.26, 0.1, 0, 21.7, [0.8, 0.86, 1.0]),
  G([0.07, -0.02, 0.05, 1.2], 1, 0.5, 0.9, 2, 0.4, 0.07, 0.9, 7.9, [0.78, 0.86, 1.0]),
  G([-0.62, -0.38, 0.08, 1], 2, 0, 0.3, 0, 0, 0.22, 0.4, 5.3, [1, 1, 1]),
  G([0.36, -0.52, 0.07, 1], 0, 1.5, 0.35, 2, 0.3, 0.13, 0, 12.4, [0.9, 0.9, 1.0]),
  G([-0.18, 0.62, 0.06, 1], 0, 0.9, -1.2, 4, 0.42, 0.06, 0, 33.3, [0.66, 0.8, 1.0]),
];

// fundo do site: poucas galáxias médias assadas no campo profundo
const FUNDO = [
  G([1.32, 0.22, 0.05, 1], 0, 1.0, 0.7, 2, 0.3, 0.08, 0, 44.1, [0.72, 0.84, 1.0]),
  G([0.2, 0.86, 0.035, 1], 2, 0, -0.4, 0, 0, 0.22, 0.25, 9.9, [1, 1, 1]),
];
const FUNDO_MOB = [
  G([0.47, 0.18, 0.06, 1], 0, 1.0, 0.7, 2, 0.3, 0.08, 0, 44.1, [0.72, 0.84, 1.0]),
  G([0.12, 1.3, 0.04, 1], 2, 0, -0.4, 0, 0, 0.22, 0.25, 9.9, [1, 1, 1]),
];

const f = PREVIA ? 0.5 : 1;
const R = (n) => Math.round(n * f);

if (!process.env.SO || process.env.SO === "soltas") {
  console.log("galáxias soltas");
  for (const [nome, g] of SOLTAS) {
    const buf = await render({ w: R(720), h: R(720), ss: 2, modo: 2, galaxias: [g], expo: 1 });
    await salvar(buf, nome, [["webp", { quality: 82, effort: 6 }]]);
  }
}
if (!process.env.SO || process.env.SO === "ceu") {
  console.log("céu do buraco negro");
  const ceu = await render({ w: R(2048), h: R(2048), ss: 1, modo: 0, semente: 1.7, galaxias: CEU, expo: 1 });
  await salvar(ceu, "ceu-2048", [["webp", { quality: 84, effort: 6 }]]);
  await salvar(await sharp(ceu).resize(R(1024), R(1024), { kernel: "lanczos3" }).toBuffer(), "ceu-1024", [["webp", { quality: 84, effort: 6 }]]);
}
if (!process.env.SO || process.env.SO === "fundo") {
  console.log("fundo do site");
  const fundo = await render({ w: R(1920), h: R(1200), ss: 2, modo: 1, semente: 4.2, galaxias: FUNDO, expo: 1 });
  await salvar(fundo, "fundo", [["webp", { quality: 80, effort: 6 }]]);
  const mob = await render({ w: R(1000), h: R(1700), ss: 2, modo: 1, semente: 8.6, galaxias: FUNDO_MOB, expo: 1 });
  await salvar(mob, "fundo-mob", [["webp", { quality: 80, effort: 6 }]]);
}
if (!process.env.SO || process.env.SO === "estrelas") {
  console.log("estrelas em mosaico");
  // camada de trás: muitas e fracas; da frente: poucas e fortes, algumas com raios
  const e1 = await render({ w: R(1024), h: R(1024), ss: 1, modo: 3, semente: 2.0, cel: 18, dens: 0.42, lum: 0.55 });
  await salvar(e1, "estrelas-1", [["webp", { lossless: true, effort: 6 }]]);
  const fortes = [
    [240, 350, 1.7, 9500],
    [1350, 1010, 1.3, 5200],
    [850, 1720, 2.0, 15000],
    [1780, 280, 1.1, 4100],
  ];
  const e2 = await render({ w: R(2048), h: R(2048), ss: 1, modo: 3, semente: 5.0, cel: 46, dens: 0.26, lum: 0.9, brilhantes: fortes.map(([x, y, b, T]) => [x * f, y * f, b, T]) });
  await salvar(e2, "estrelas-2", [["webp", { lossless: true, effort: 6 }]]);
}

await browser.close();
