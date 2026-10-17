# Prompt mestre · Lead Page Carlos 2.0

> Cole este arquivo inteiro no Claude Code, dentro do repositório `leadpagecarlos2.0`.
> Tudo o que está aqui foi decidido para um objetivo duplo: **conseguir estágio ou vaga júnior** e **vender sites**.

---

## 0. Papel

Atue como um **Creative Technologist sênior** (front-end, WebGL e motion design) que também pensa como **recrutador de tecnologia** e como **dono de pequeno negócio que quer vender mais**.

Construa do zero, neste repositório vazio, a landing page pessoal do Carlos Serra: imersiva, rápida, acessível e pronta para publicar no GitHub Pages.

Tema: **"Gótico Cósmico"**, um buraco negro com horizonte de eventos, disco de acreção dourado e tipografia gótica (blackletter).

---

## 1. Quem é o Carlos (use estes dados reais, sem inventar nada)

- **Nome:** Carlos Serra · **Cargo:** Desenvolvedor Full Stack Júnior · **Local:** Palhoça, SC (Grande Florianópolis)
- **Formação:** Análise e Desenvolvimento de Sistemas, FMP (Faculdade Municipal de Palhoça), 2ª fase. Programa desde agosto de 2026.
- **Contato:**
  - WhatsApp (48) 99617-0281 → `https://wa.me/5548996170281`
  - E-mail `carlosserraap55@gmail.com`
  - GitHub `https://github.com/carlosserra-a11y`
  - LinkedIn e currículo (PDF): campos vazios na configuração; quando vazios, os botões **somem**.
- **Números verificáveis:** 5 clientes reais · 9 sites no ar · 19 repositórios públicos.
- **Stack que ele usa de verdade:**
  - Front-end: HTML, CSS, JavaScript, TypeScript, React 19, Vite e Tailwind
  - Back-end: Node.js, Express 5 e SQLite
  - 3D e animação: three.js, WebGL/GLSL e GSAP
  - IA: Gemini API
  - Testes e entrega: node:test e GitHub Actions

### Melhores repositórios (são os objetos 3D da página)
| # | Projeto | Cliente | Repositório | Site no ar | O que tem de forte |
|---|---|---|---|---|---|
| 1 | Figaro's Pizzaria 2.0 | Pizzaria · Palhoça | `Figarus-2.0` | carlosserra-a11y.github.io/Figarus-2.0/ | Montador de pizza, checkout por CEP, Express + SQLite, painel do dono, pizza 3D, testes |
| 2 | São Cristóvão 3.0 | Hamburgueria · Palhoça | `sao-cristovao-3.0` | carlosserra-a11y.github.io/sao-cristovao-3.0/ | React 19 + TypeScript, burger na rolagem, atendente de IA que monta o pedido, 10 arquivos de teste |
| 3 | Smartech 3.0 | Coifas UV-C · Florianópolis | `smartech-3.0` | carlosserra-a11y.github.io/smartech-3.0/ | Showroom 3D com Raio-X, calculadora NBR 14518, consultor com IA |
| 4 | Ingrid Lima | Videomaker | `ingrid-market` | carlosserra-a11y.github.io/ingrid-market/ | Olho realista feito só com shader WebGL, portfólio em vídeo |
| 5 | CS Store | Loja de iPhones · Palhoça | `csiphone` | carlosserra-a11y.github.io/csiphone/ | Showroom 3D, catálogo, calculadora de troca |

Capturas de tela prontas existem no repositório antigo `carlosserra-a11y/leadpagecarlos`, na pasta `assets/projetos/`:
- `figarus`, `saocristovao`, `smartech`, `ingrid` e `csstore`, cada um nos formatos `-1-1280.webp`, `-1-640.webp` e `-mob.webp`;
- dos três primeiros também `-longa.webp`, com a página inteira.

Copie essas capturas para `public/projetos/`.

**Regra de ouro:** nada de depoimento, métrica, cliente ou prêmio inventado. A seção de depoimentos só aparece se houver texto real em `dados.ts`; vazia, ela some.

---

## 2. Objetivo e público

1. **Recrutador ou tech lead** (30 segundos de leitura): quer ver nome, cargo e disponibilidade, os 3 melhores projetos com prova (site no ar e código), a stack e como falar com ele. Precisa de um caminho rápido: **"Sou recrutador"** leva a currículo, LinkedIn, e-mail copiável e um resumo para copiar e colar no ATS.
2. **Dono de pequeno negócio** (pizzaria, loja, clínica, prestador de serviço): quer entender o que o Carlos entrega, ver sites de clientes parecidos e chamar no WhatsApp com uma mensagem pronta. Precisa de um caminho rápido: **"Quero um site"** leva a pacotes, processo e um formulário de briefing que envia pelo WhatsApp.

A página inteira deve deixar claros esses dois caminhos, desde o topo.

---

## 3. Identidade visual: Gótico Cósmico

### 3.1 Tipografia (gótica, inspirada nas referências do Carlos)
As referências são três imagens:
- um **alfabeto gótico em círculo** (textura medieval);
- um **alfabeto gótico estilo tatuagem** ("chicano lettering");
- um **alfabeto Old English** clássico.

A comparação das fontes está em `referencias/fontes-goticas.png`.

| Uso | Fonte (Google Fonts) | Regras |
|---|---|---|
| Logo, nome no hero, números grandes | **UnifrakturCook 700** | Só em tamanhos grandes (≥ 40 px). Gradiente dourado. |
| Alternativa estilo tatuagem para o nome | **Manufacturing Consent** | Fica como variação via variável CSS `--f-gothic-alt`. |
| Títulos de seção (h2/h3) | **Grenze Gotisch** 600–800 | Gótica legível. Tracking levemente negativo. |
| Texto corrido, botões, formulários | **Inter** (ou Geist) 400–600 | Legibilidade em primeiro lugar. Nunca use gótica em parágrafo. |
| Detalhes técnicos (datas, tags, HUD, código) | **JetBrains Mono** 400–600 | Caixa-alta pequena com espaçamento largo. |

- Carregue as fontes com `next/font/google` (self-hosted no build, `display: "swap"`, só os pesos usados).
- Todo texto em gótica precisa existir como texto real no HTML (SEO e leitor de tela). A gótica é estilo, não imagem.
- **Anel de letras góticas:** baseado na primeira referência, um anel com o alfabeto `A B C D E F G H I J K L M N O P Q R S T U V W X Y Z` em UnifrakturMaguntia gira devagar em volta do horizonte de eventos. Faça em SVG `textPath` sobre o canvas, ou como texto 3D com `@react-three/drei <Text>`. É decorativo: `aria-hidden`.

### 3.2 Paleta
| Token | Cor | Uso |
|---|---|---|
| `--void` | `#020205` | Fundo, a singularidade (preto puro no centro) |
| `--space` | `#07060d` | Seções |
| `--nebula` | `#1a1030` | Brilhos roxos de fundo |
| `--gold` | `#f2c14e` | Disco de acreção, gradiente do H1, botão principal |
| `--gold-hi` | `#fff1c1` | Brilho máximo do disco e do texto |
| `--ember` | `#ff7a1a` | Borda quente do disco (efeito Doppler) |
| `--ice` | `#9ec5ff` | Lado frio do disco e detalhes técnicos |
| `--text` / `--muted` | `#f5f1e8` / `#a59fb3` | Texto e texto secundário (contraste AA conferido) |

- **Gradiente do H1:** `linear-gradient(180deg, #fff6d6 10%, #f2c14e 55%, #b06d1a)` com `background-clip: text`.
- **Glassmorphism:** `backdrop-blur-md`, `bg-white/5`, `border-[rgba(255,255,255,0.15)]`, cantos 16–24 px.

### 3.3 Logo
Monograma **"CS"** em UnifrakturCook dentro de um anel fino (o horizonte de eventos), com um pequeno arco dourado (o disco).

Gere em SVG: `public/marca/logo.svg`, `favicon.svg`, os ícones 32/180/192 e `og.png` (1200×630) com o nome em gótica sobre o buraco negro.

---

## 4. Stack e estrutura

- **Base:** Next.js (versão estável mais recente, App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4
- **3D:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` (bloom e lente)
- **Animação:** `motion` (o Framer Motion atual, import de `motion/react`) para a interface e o `useScroll`, mais `lenis` para rolagem suave. Use GSAP + ScrollTrigger só se precisar de um "pin" complexo.
- **Ícones:** `lucide-react`. **Utilitários:** `clsx` + `tailwind-merge` (`cn`), estrutura de componentes no padrão shadcn (`components/ui`).
- **Publicação:** GitHub Pages com exportação estática.
  - `next.config.ts`: `output: "export"`, `basePath: "/leadpagecarlos2.0"`, `images: { unoptimized: true }`, `trailingSlash: true`.
  - Workflow `.github/workflows/deploy.yml` com `actions/upload-pages-artifact` + `actions/deploy-pages`.

```
app/
  layout.tsx            fontes, metadados, JSON-LD (Person + ProfessionalService), tema
  page.tsx              monta as seções na ordem abaixo
  globals.css           tokens da paleta, utilitários de vidro, gradiente dourado
components/
  hero/BananaHero.tsx           container do hero com a interface por cima (nome mantido do prompt de referência; pode virar CosmicHero.tsx)
  hero/SpaceVortexCanvas.tsx    canvas 3D isolado (carregado com dynamic import, ssr:false)
  hero/shaders/                 lente gravitacional, disco de acreção, anel de fótons
  hero/GothicRing.tsx           anel do alfabeto gótico
  sections/…                    uma pasta por seção (Projetos, Servicos, Processo, Stack, Sobre, Contato)
  three/ProjectOrbit.tsx        galáxia de projetos (3D)
  ui/…                          botão, badge, card de vidro (padrão shadcn)
lib/dados.ts                    todos os textos, links, projetos e pacotes (PT e EN)
lib/cn.ts, lib/useDeviceTier.ts (decide a qualidade do 3D)
public/projetos, public/marca
```

---

## 5. Seções (nesta ordem)

### 5.1 Tela de carregamento (máximo 2 s)
- **Sequência:** fundo preto → o anel de letras góticas se forma girando → "Carlos Serra" em UnifrakturCook aparece do centro → contador 000–100 em mono ligado ao carregamento real (fontes + cena 3D) → a cortina se abre em círculo a partir do centro, como se entrasse no buraco negro.
- Só na primeira visita da sessão (`sessionStorage`).
- Pula com qualquer tecla, clique, toque ou rolagem.
- Não aparece com `prefers-reduced-motion` nem sem JavaScript.
- Tem prazo máximo, para nunca prender a página.

### 5.2 Hero: o Horizonte de Eventos
Esta seção é a adaptação do prompt de referência do Carlos ("Buraco Negro / Evento de Horizonte").

**Cena 3D (`SpaceVortexCanvas`)**
- **Singularidade:** uma esfera preta pura no centro, com anel de fótons fino e brilhante (shader de borda) e bloom suave.
- **Disco de acreção em vórtice:**
  - Feito com `InstancedMesh`: centenas de fragmentos dourados (cristais facetados ou pedaços de "código" em formato de bloco) orbitando em espiral.
  - Em `useFrame`, a velocidade angular varia com a distância (perto do centro gira mais rápido, como a Lei de Kepler).
  - Leve oscilação vertical. A cor mistura `--ember` → `--gold` → `--ice` pela posição, para simular o Doppler.
- **No lugar das bananas** do prompt de referência, use os fragmentos dourados e o anel de letras góticas: combina com a identidade e com o tom profissional. Deixe a geometria da `InstancedMesh` num único ponto do código, para trocar por bananas facilmente se o Carlos pedir.
- **Lente gravitacional:** passo de pós-processamento que distorce o fundo (campo de estrelas e nebulosa) em volta do horizonte, com deslocamento radial que cai com 1/r. Deixe-o desligável por qualidade.
- **Fundo:**
  - campo de estrelas com `Points` (parallax por camadas);
  - nebulosa roxa/azul feita em shader de ruído;
  - poeira passando na frente da câmera.
- **Parallax 3D pelo mouse:** a câmera responde a `pointer.x`/`pointer.y` com `lerp` (fator ~0,05), em camadas (estrelas longe se movem menos). No celular, use a inclinação do aparelho se houver permissão; se não, deixe parado.
- **Rolagem:**
  - Conforme a pessoa rola dentro do hero, um "dolly zoom" sutil leva a câmera em direção à singularidade, o FOV sobe um pouco e o disco gira mais rápido.
  - A interface some com fade e blur.
  - No fim do hero, a tela passa "através" do horizonte (escurece até `--void`) e entra na próxima seção.
- **Desempenho:**
  - Instâncias por nível de aparelho: alto **1500**, médio **700**, celular **350**. Aparelho fraco, sem WebGL ou com "reduzir movimento": pôster estático (imagem gerada da própria cena, AVIF/WebP).
  - DPR máximo 1,5. `frameloop` pausa quando o hero sai da tela ou a aba fica escondida.
  - Monitor de FPS: se a mediana passar de 45 ms, reduz instâncias e desliga a lente.

**Interface por cima (centralizada, vidro)**
- **Badge:** `✦ Disponível para estágio, vaga júnior e novos projetos` (vidro, ponto verde pulsando).
- **H1 (gótica, UnifrakturCook, gradiente dourado):** `Carlos Serra`.
- **Linha de cargo (mono):** `Desenvolvedor Full Stack Júnior · Palhoça, SC`.
- **Frase de venda** (a frase do prompt de referência, adaptada; Grenze Gotisch, tamanho médio): `A gravidade inevitável do seu negócio`.
- **Subtítulo** (Inter, curto): `Sites e sistemas que puxam clientes direto para o seu WhatsApp, com 3D, banco de dados e IA quando faz sentido.`
- **CTAs:**
  - **Primário** dourado brilhante: `Quero um site`. Abre a seção de briefing; tem hover com brilho correndo e leve atração magnética.
  - **Secundário** em contorno: `Ver projetos`.
  - **Terceiro** (link de texto): `Sou recrutador →`, que leva ao bloco de currículo.
- **Números** (mono, contador subindo): 5 clientes reais · 9 sites no ar · 19 repositórios.
- **Detalhes em volta (HUD discreto):**
  - coordenadas de Palhoça;
  - relógio de Brasília;
  - `RA 17h45m · DEC −29°` (referência ao centro da Via Láctea);
  - indicador de rolagem.

### 5.3 Galáxia de Projetos (3D com os melhores repositórios)
- **Seção fixada na tela:**
  - Os 5 projetos são **monólitos de vidro escuro** com a captura do site como textura, orbitando o mesmo buraco negro, agora menor no centro.
  - A rolagem gira a órbita e traz um projeto por vez para a frente.
  - O projeto da frente mostra ao lado um painel de vidro com nome, cliente, desafio, o que foi feito (3 itens), stack (tags), "Site no ar ↗", "Código ↗" e "Estudo de caso".
- **Interação:**
  - **Hover:** inclina o monólito e acende a borda dourada.
  - **Clique:** abre o estudo de caso em um modal com galeria (computador e celular), desafio, solução, decisões técnicas e como conferir.
  - **Teclado:** ← → navega; Esc fecha.
- **Celular:** carrossel 2D com arrastar (sem 3D pesado), mesmo conteúdo.
- **Abaixo:** **"Arquivo"** com todos os 19 repositórios em lista com filtros (clientes, 3D, IA, React, back-end, estudos). Repositórios novos entram pela API do GitHub, com cache de 1 hora e falha silenciosa.

### 5.4 Serviços: o que eu faço para o seu negócio (vender sites)
**Pacotes** em cards de vidro com ícone lucide:
| Pacote | Inclui |
|---|---|
| Landing page | Uma página, WhatsApp, formulário, animações |
| Site institucional | Várias páginas, SEO, Google Maps |
| Loja ou catálogo | Produtos, carrinho ou pedido por WhatsApp |
| Sistema com painel | Login, banco de dados, área do dono |

- **Preço:** vem de `dados.ts` (`precoInicial`). Se estiver vazio, mostra "Sob consulta". Nunca invente valor.
- **Diferenciais (só verdades):** código próprio, site rápido (Lighthouse), acessibilidade, publicação e domínio, pedido direto no WhatsApp, suporte depois de publicado.

### 5.5 Processo (linha do tempo)
Conversa → Proposta → Design → Desenvolvimento → Publicação e suporte.

Cada etapa acende conforme a rolagem: a linha é uma órbita que vai sendo traçada.

### 5.6 Stack (prova, não lista)
Seis áreas: Front-end, Back-end, 3D e animação, IA aplicada, Qualidade e Ferramentas. Cada área aponta para o projeto onde dá para conferir o código.

Visual: constelações. Cada tecnologia é uma estrela, e o hover liga as linhas da constelação.

### 5.7 Sobre + bloco do recrutador
- **Conteúdo:**
  - retrato (copie `assets/foto/retrato-*` do repositório antigo);
  - bio curta;
  - ficha: base, formação, formato (presencial, híbrido ou remoto) e idiomas;
  - trajetória 2026 (do primeiro commit, em 20 de agosto, ao São Cristóvão 3.0, em 11 de outubro).
- **Bloco "Sou recrutador":**
  - currículo PDF;
  - LinkedIn;
  - "Copiar resumo para o ATS", com texto pronto em PT e EN;
  - "Copiar e-mail";
  - "Salvar contato (.vcf)".

### 5.8 Contato: briefing que vira mensagem de WhatsApp
- **Canais em cards:**
  - WhatsApp (o principal);
  - e-mail com botão de copiar;
  - GitHub;
  - LinkedIn, só se houver;
  - QR code do WhatsApp, só no computador.
- **Formulário:**
  - **Campos:**
    - "Sobre o quê?": chips **Vaga/estágio**, **Site ou sistema** ou **Outro**;
    - se for site: tipo, prazo e orçamento, este opcional (chips);
    - nome, empresa (opcional), e-mail (opcional) e mensagem.
  - **Prévia ao vivo** da mensagem num balão.
  - **Envio:** **Enviar pelo WhatsApp**, que abre `wa.me` com o texto codificado e quebras de linha, ou **Enviar por e-mail** (`mailto`).
- Mostra a hora de Palhoça ao vivo e o prazo de resposta definido em `dados.ts`.

### 5.9 Rodapé
- Chamada final: `Pronto para entrar na órbita?` → botão para o WhatsApp.
- Mapa do site, contatos, projetos no ar, status (disponível) e relógio.
- Assinatura: `© 2026 Carlos Serra · feito à mão com Next.js, three.js e muito café`.
- **"Carlos Serra" gigante em gótica**, com contorno, que acende em dourado onde o mouse passa.

---

## 6. Movimento (regras)

- **Rolagem:**
  - Lenis com `lerp` 0,1.
  - Os títulos sobem palavra por palavra, com máscara.
  - As imagens se abrem com `clip-path`.
  - O parallax de fundo tem três camadas: estrelas, nebulosa e poeira.
- **Microinterações:**
  - botões com atração magnética;
  - anel que segue o cursor (só com mouse);
  - texto gótico que "acende" no hover;
  - contadores que sobem uma vez ao aparecer.
- **Proibido:**
  - animar `width`, `height`, `top` ou `left`;
  - piscar mais de 3 vezes por segundo;
  - prender a rolagem do usuário;
  - esconder conteúdo importante atrás de animação.
- **`prefers-reduced-motion`:** sem loader, sem parallax e sem 3D animado (pôster); tudo visível e completo.

---

## 7. Qualidade (critérios de aceite)

- **Lighthouse (celular):** desempenho ≥ 90, acessibilidade ≥ 95, boas práticas ≥ 95, SEO 100. LCP < 2,5 s e CLS < 0,1.
- **Peso:** o 3D só carrega depois da primeira pintura (dynamic import). O JS inicial fica abaixo de 200 KB gzip, sem contar o chunk do 3D.
- **Acessibilidade:**
  - um `h1` só;
  - landmarks;
  - foco visível (dourado);
  - canvas `aria-hidden`;
  - modal com foco preso e devolvido a quem abriu;
  - contraste AA;
  - tudo navegável por teclado.
- **Sem JavaScript:** o conteúdo inteiro aparece (texto, projetos com link, contatos). O formulário vira um link de WhatsApp.
- **Responsivo:** de 320 px a 2560 px, sem rolagem horizontal. Botões com no mínimo 44 px.
- **SEO:**
  - título e descrição em PT;
  - Open Graph e Twitter;
  - JSON-LD Person + ProfessionalService (área atendida: Grande Florianópolis);
  - `sitemap.xml` e `robots.txt`.
- **Idiomas:** PT (padrão) e EN, com troca sem recarregar, de textos vindos de `dados.ts`.
- **Segurança:**
  - links externos com `rel="noopener noreferrer"`;
  - nenhum segredo no código;
  - CSP compatível com exportação estática;
  - sem scripts de terceiros, exceto as fontes, que já ficam self-hosted pelo `next/font`.
- **Testes:**
  - Playwright com smoke test: carrega, sem erro no console, CTAs com `href` certos, o modal abre e fecha, o formulário monta a mensagem e o site não quebra em 390 px e 1440 px;
  - `tsc --noEmit` e ESLint limpos.
- **CI (`.github/workflows/qualidade.yml`):** lint, typecheck, build, Playwright e Lighthouse CI com orçamento. **Deploy** pelo `deploy.yml` em todo push na `main`.

---

## 8. Ordem de execução (Claude Code)

1. Crie o projeto Next.js com TypeScript, Tailwind v4 e ESLint, e configure a exportação estática e o `basePath`. Instale `three @react-three/fiber @react-three/drei @react-three/postprocessing motion lenis lucide-react clsx tailwind-merge`.
2. Escreva `lib/dados.ts` (textos PT/EN, projetos, pacotes e contatos) e os tokens de `globals.css`. Configure as fontes góticas com `next/font`.
3. Monte o esqueleto de todas as seções com conteúdo real e sem 3D. A página já deve estar completa e bonita sem WebGL.
4. Construa o hero: `SpaceVortexCanvas` (singularidade, disco instanciado, estrelas, nebulosa, lente), `GothicRing`, interface de vidro, parallax do mouse e dolly zoom na rolagem.
5. Construa a Galáxia de Projetos (3D) com o fallback 2D para celular e o modal de estudo de caso.
6. Construa o loader, as microinterações, o formulário de briefing e o rodapé.
7. Gere a marca (logo, favicon, ícones, og.png) e o pôster do hero.
8. Rode testes, Lighthouse e o build estático. Corrija até passar nos critérios da seção 7.
9. Escreva o `README.md` em português: o que é, como rodar (`npm install && npm run dev`), como editar `lib/dados.ts` e como publicar. Ative o GitHub Pages (Actions) e publique.

Escreva código completo, modular e sem placeholders ("// preencha depois"). Comentários em português, curtos, explicando o porquê.

**Definição de pronto:** a página está no ar em `https://carlosserra-a11y.github.io/leadpagecarlos2.0/`, passa nos critérios da seção 7 e o Carlos consegue trocar textos, projetos e preços só editando `lib/dados.ts`.
