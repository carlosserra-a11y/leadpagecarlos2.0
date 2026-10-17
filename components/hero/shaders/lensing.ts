import { Effect } from "postprocessing";
import { Uniform, Vector2 } from "three";

/* Lente gravitacional como pós-processamento: cada pixel busca a imagem um pouco mais perto
   do buraco negro, com deslocamento que cai com 1/r (como o anel de Einstein).
   Dentro do horizonte não distorce (lá é tudo preto). */
const frag = /* glsl */ `
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
uniform float uAspectX;

void mainUv(inout vec2 uv) {
  vec2 d = uv - uCenter;
  d.x *= uAspectX;
  float r = max(length(d), 1e-4);
  float k = uStrength * uRadius * uRadius / r;
  k *= smoothstep(uRadius * 0.95, uRadius * 1.5, r);
  vec2 off = (d / r) * k;
  off.x /= uAspectX;
  uv -= off;
}
`;

export class LensingEffect extends Effect {
  constructor() {
    super("LensingEffect", frag, {
      uniforms: new Map<string, Uniform>([
        ["uCenter", new Uniform(new Vector2(0.5, 0.66))],
        ["uRadius", new Uniform(0.1)],
        ["uStrength", new Uniform(0.55)],
        ["uAspectX", new Uniform(1.6)],
      ]),
    });
  }
  set(center: Vector2, radius: number, aspect: number, strength: number) {
    (this.uniforms.get("uCenter")!.value as Vector2).copy(center);
    this.uniforms.get("uRadius")!.value = radius;
    this.uniforms.get("uAspectX")!.value = aspect;
    this.uniforms.get("uStrength")!.value = strength;
  }
}
