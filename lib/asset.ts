// Arquivos de public/ precisam do basePath do GitHub Pages na frente
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
