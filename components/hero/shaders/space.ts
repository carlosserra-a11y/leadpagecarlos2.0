import { COR, vec3 } from "./common";

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
      vCol = aSeed < 0.18 ? ${vec3(COR.ice)} : aSeed > 0.9 ? ${vec3(COR.silverHi)} : vec3(1.0, 0.97, 0.93);
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
