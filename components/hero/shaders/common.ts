/* Paleta interestelar em RGB 0–1 (o canvas trabalha em espaço de exibição) */
export const COR = {
  silver: [0.949, 0.757, 0.306],
  silverHi: [1.0, 0.945, 0.757],
  cosmic: [1.0, 0.478, 0.102],
  ice: [0.62, 0.83, 1.0],
} as const;

export const vec3 = (c: readonly number[]) => `vec3(${c.map((n) => n.toFixed(3)).join(", ")})`;
