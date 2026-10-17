import "server-only";
import { CONFIG, REPOS, type Repo } from "./dados";

type GhRepo = { name: string; description: string | null; fork: boolean; pushed_at: string; has_pages: boolean; language: string | null };

/* Repositórios novos no GitHub entram sozinhos no Arquivo.
   A busca acontece no build (no GitHub Actions, a cada push e uma vez por semana),
   então o navegador do visitante não chama a API: sem limite de requisições e sem erro no console.
   Sem rede ou com a API fora do ar, fica só a lista de dados.ts. */
export async function reposNovos(): Promise<Repo[]> {
  if (!CONFIG.buscarRepos) return [];
  const conhecidos = new Set([...REPOS.map((r) => r.n.toLowerCase()), CONFIG.repoDoSite.toLowerCase()]);
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const r = await fetch(`https://api.github.com/users/${CONFIG.github}/repos?per_page=100&sort=pushed`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return [];
    const lista = (await r.json()) as GhRepo[];
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((g) => !g.fork && !conhecidos.has(g.name.toLowerCase()))
      .map((g) => ({
        n: g.name,
        t: g.name.replace(/[-_]+/g, " "),
        d: g.description || "",
        de: g.description || "",
        l: g.language || "",
        c: "inicio" as const,
        at: g.pushed_at.slice(0, 10),
        pages: g.has_pages,
        tags: `${(g.language || "").toLowerCase()} ${(g.description || "").toLowerCase()}`,
        novo: true,
      }));
  } catch {
    return [];
  }
}
