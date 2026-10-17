/* Ruído 3D barato (value noise) e fbm, compartilhados pelos shaders do hero */
export const NOISE = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
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
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < OCTAVES; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}
`;

/* Paleta Gótico Cósmico em RGB 0–1 (o canvas trabalha em espaço de exibição) */
export const COR = {
  void: [0.008, 0.008, 0.02],
  gold: [0.949, 0.757, 0.306],
  goldHi: [1.0, 0.945, 0.757],
  ember: [1.0, 0.478, 0.102],
  ice: [0.62, 0.773, 1.0],
  nebula: [0.102, 0.063, 0.188],
} as const;

export const vec3 = (c: readonly number[]) => `vec3(${c.map((n) => n.toFixed(3)).join(", ")})`;
