import { COR, NOISE, vec3 } from "./common";

/* Nebulosa roxa/azul numa esfera vista por dentro: ruído em camadas, bem sutil */
export const nebula = (octaves: number) => ({
  vertexShader: /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #define OCTAVES ${octaves}
    uniform float uTime;
    varying vec3 vDir;
    ${NOISE}
    void main() {
      vec3 d = vDir;
      float n = fbm(d * 2.1 + vec3(0.0, uTime * 0.008, 0.0));
      float n2 = fbm(d * 4.3 - vec3(uTime * 0.005, 0.0, 0.0) + n);
      float lanes = smoothstep(0.25, 0.75, fbm(d * 7.0 + n2));
      vec3 col = ${vec3(COR.void)};
      col += ${vec3(COR.nebula)} * 1.5 * smoothstep(0.42, 0.88, n) * (0.55 + 0.6 * lanes);
      col += vec3(0.05, 0.09, 0.2) * smoothstep(0.5, 0.95, n2) * 0.9;
      col += ${vec3(COR.gold)} * 0.12 * pow(max(0.0, n * n2 * 1.7 - 0.38), 1.6);
      // a faixa da galáxia atravessando o fundo
      float band = exp(-pow((d.y + d.x * 0.35) * 3.2, 2.0));
      col += vec3(0.07, 0.05, 0.11) * band * (0.4 + n);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});

/* Estrelas em camadas: tamanho por distância, cintilação e temperatura de cor */
export const stars = {
  vertexShader: /* glsl */ `
    attribute float aSize;
    attribute float aSeed;
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vTw;
    varying vec3 vCol;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(aSize * uPixelRatio * (55.0 / -mv.z), 1.0, 9.0 * uPixelRatio);
      vTw = 0.6 + 0.4 * sin(uTime * (0.6 + aSeed * 2.4) + aSeed * 61.0);
      vCol = aSeed < 0.18 ? ${vec3(COR.ice)} : aSeed > 0.9 ? ${vec3(COR.goldHi)} : vec3(1.0, 0.97, 0.93);
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vTw;
    varying vec3 vCol;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float core = smoothstep(0.5, 0.0, d);
      float a = pow(core, 2.6) * vTw;
      if (a < 0.01) discard;
      gl_FragColor = vec4(vCol * a, 1.0);
    }
  `,
};

/* Poeira cósmica perto da câmera: dá profundidade quando o mouse mexe */
export const dust = {
  vertexShader: /* glsl */ `
    attribute float aSeed;
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vA;
    void main() {
      vec3 p = position;
      p.x += sin(uTime * 0.05 + aSeed * 30.0) * 0.6;
      p.y += mod(uTime * (0.04 + aSeed * 0.05) + aSeed * 8.0, 8.0) - 4.0;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp((1.0 + aSeed * 2.5) * uPixelRatio * (8.0 / -mv.z), 1.0, 6.0 * uPixelRatio);
      vA = 0.25 + 0.35 * aSeed;
      // some perto demais da câmera
      vA *= smoothstep(0.8, 2.5, -mv.z);
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vA;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.1, d) * vA;
      if (a < 0.01) discard;
      gl_FragColor = vec4(vec3(1.0, 0.9, 0.75) * a, 1.0);
    }
  `,
};
