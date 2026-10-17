import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // exportação estática para o GitHub Pages: as imagens já saem otimizadas (webp/avif + srcset)
      "@next/next/no-img-element": "off",
    },
  },
  {
    // No React Three Fiber os objetos do three.js são mutados a cada quadro dentro do useFrame,
    // fora do ciclo de renderização do React. A regra foi feita para o React Compiler, que não usamos aqui.
    files: ["components/three/**", "components/hero/SpaceVortexCanvas.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "tests/relatorios/**"]),
]);

export default eslintConfig;
