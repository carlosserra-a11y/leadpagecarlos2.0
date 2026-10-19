import { asset } from "@/lib/asset";

/* O espaço atrás do site inteiro, em camadas de profundidade (imagens geradas por ferramentas/cosmos.mjs):
   campo profundo com nebulosa → estrelas fracas → estrelas fortes → galáxias soltas → grão de filme.
   Sem JavaScript tudo aparece parado; com JavaScript o Parallax move cada camada numa velocidade
   (rolagem e mouse) e as galáxias passam devagar, cada uma numa distância. */

// p = em que ponto da rolagem (0–1) a galáxia passa pelo meio da tela · f = velocidade (mais perto = mais rápida)
// x = posição horizontal · w = largura · r = giro · o = opacidade (as de longe são mais apagadas)
const GALAXIAS = [
  { src: "galaxia-1", p: 0.2, f: 0.34, x: 76, w: 400, r: 0, o: 1 },
  { src: "galaxia-5", p: 0.27, f: 0.14, x: 18, w: 150, r: 20, o: 0.7 },
  { src: "galaxia-4", p: 0.36, f: 0.24, x: 10, w: 340, r: -14, o: 0.9 },
  { src: "galaxia-3", p: 0.47, f: 0.42, x: 82, w: 460, r: 16, o: 1 },
  { src: "galaxia-2", p: 0.6, f: 0.28, x: 14, w: 360, r: 24, o: 0.95 },
  { src: "galaxia-6", p: 0.72, f: 0.22, x: 84, w: 330, r: -30, o: 0.9 },
  { src: "galaxia-5", p: 0.8, f: 0.12, x: 60, w: 120, r: -40, o: 0.6 },
  { src: "galaxia-4", p: 0.88, f: 0.18, x: 24, w: 240, r: 150, o: 0.8 },
  { src: "galaxia-1", p: 0.98, f: 0.38, x: 72, w: 300, r: 70, o: 1 },
];

// só WebP: dentro de uma variável CSS, um image-set() que o navegador não entende não teria alternativa
const imagem = (nome: string) => `url("${asset(`/cosmos/${nome}.webp`)}")`;

export function Cosmos() {
  const vars = {
    "--fundo": imagem("fundo"),
    "--fundo-mob": imagem("fundo-mob"),
    "--estrelas-1": `url("${asset("/cosmos/estrelas-1.webp")}")`,
    "--estrelas-2": `url("${asset("/cosmos/estrelas-2.webp")}")`,
  } as React.CSSProperties;
  return (
    <div className="cosmos" style={vars} aria-hidden="true">
      <div className="cosmos-fundo" data-camada="fundo" />
      <div className="cosmos-estrelas cosmos-e1" data-camada="0.05" data-mouse="5" />
      <div className="cosmos-estrelas cosmos-e2" data-camada="0.12" data-mouse="12" />
      <div className="cosmos-galaxias">
        {GALAXIAS.map((g, i) => (
          <img
            key={i}
            src={asset(`/cosmos/${g.src}.webp`)}
            alt=""
            width={720}
            height={720}
            decoding="async"
            fetchPriority="low"
            data-galaxia=""
            data-p={g.p}
            data-f={g.f}
            style={{ "--x": `${g.x}%`, "--w": `${g.w}px`, "--giro": `${g.r}deg`, "--o": g.o, "--y": `${Math.round(g.p * 100)}%` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="cosmos-grao" />
    </div>
  );
}
