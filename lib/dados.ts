/* =========================================================================
   DADOS DO SITE · edite aqui. O resto da página se monta sozinho.
   Regra de ouro: nada inventado. Campo vazio ("") faz o item sumir.
   ========================================================================= */

export type Lang = "pt" | "en";
export type Txt = Record<Lang, string>;
export type TxtList = Record<Lang, string[]>;

/* ----- Configuração geral ----- */
export const CONFIG = {
  nome: "Carlos Serra",
  github: "carlosserra-a11y",
  repoDoSite: "leadpagecarlos2.0", // este repositório não entra no arquivo
  siteUrl: "https://carlosserra-a11y.github.io/leadpagecarlos2.0/",
  email: "carlosserraap55@gmail.com",
  whatsapp: "5548996170281", // só números, com DDI e DDD
  telefone: "(48) 99617-0281",
  linkedin: "", // ex.: "https://www.linkedin.com/in/seu-perfil" · vazio = botão some
  curriculo: "", // link do PDF · vazio = botão some
  buscarRepos: true, // busca repositórios novos na API do GitHub (cache de 1 hora)
  resposta: {
    pt: "Respondo em até 24 horas úteis",
    en: "I reply within 1 business day",
  } as Txt, // deixe os dois "" para esconder
  numeros: { clientes: 5, sites: 9 },
  cidade: "Palhoça, SC",
  coordenadas: "27°38′S 48°40′W",
  fuso: "America/Sao_Paulo",
};

export const waLink = (texto?: string) =>
  `https://wa.me/${CONFIG.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
export const ghLink = (repo?: string) =>
  `https://github.com/${CONFIG.github}${repo ? `/${repo}` : ""}`;
export const pagesLink = (repo: string) => `https://${CONFIG.github}.github.io/${repo}/`;

/* ----- Projetos em destaque: são os monólitos da Galáxia de Projetos ----- */
export type Projeto = {
  slug: string;
  nome: string;
  repo: string;
  shot: string; // nome das capturas em public/projetos (shot-1-640/1280.webp, shot-mob.webp)
  longa?: boolean; // tem a captura da página inteira (shot-longa.webp)
  stack: string[];
  cor: string; // cor de destaque do monólito
  evolucao?: { v: string; repo: string; txt: Txt }[];
  pt: ProjetoTexto;
  en: ProjetoTexto;
};
type ProjetoTexto = {
  cliente: string;
  tag: string;
  pitch: string;
  desafio: string;
  feito: string[]; // os 3 primeiros aparecem no painel; todos aparecem no estudo de caso
  decisoes: string[];
  prova: string;
};

export const PROJETOS: Projeto[] = [
  {
    slug: "figaros",
    nome: "Figaro's Pizzaria 2.0",
    repo: "Figarus-2.0",
    shot: "figarus",
    longa: true,
    stack: ["Node.js", "Express 5", "SQLite", "three.js", "Lenis", "node:test"],
    cor: "#ff7a1a",
    evolucao: [
      { v: "1.0", repo: "Figaros-Pizzaria", txt: { pt: "Cardápio, montador de pizza, checkout por CEP e painel com senha.", en: "Menu, pizza builder, ZIP-code checkout and a password-protected dashboard." } },
      { v: "2.0", repo: "Figarus-2.0", txt: { pt: "Visual novo, pizza 3D em código, histórico de pedidos e testes.", en: "New look, a 3D pizza built in code, order history and tests." } },
    ],
    pt: {
      cliente: "Pizzaria · Palhoça/SC",
      tag: "Full stack",
      pitch: "Cardápio enorme e pedidos bagunçados no WhatsApp viraram um site com montador de pizza, checkout por CEP, banco de dados e painel do dono.",
      desafio: "A Figaro's tem 57 sabores salgados, 14 pizzas doces, calzones, lasanhas, esfihas e combos. Os pedidos chegavam por WhatsApp, sem padrão, e o dono não tinha onde mudar preço ou horário.",
      feito: [
        "Montador de pizza: tamanho, até 3 sabores com a pizza desenhada em fatias, borda e observações",
        "Checkout com busca de endereço pelo CEP, taxa por bairro, troco e resumo enviado ao WhatsApp da loja",
        "Servidor Express + SQLite com o histórico de todos os pedidos e de todas as mudanças no cardápio",
        "Painel para cadastrar sabores, mudar preços e horários e ver os pedidos chegando com aviso sonoro",
        "Pizza 3D feita em código (three.js): as fatias caem no lugar e se abrem em leque com a rolagem",
      ],
      decisoes: [
        "Senha guardada com scrypt e código de configuração no primeiro acesso, para ninguém criar a conta antes do dono",
        "Preço de pizza com vários sabores pela média dos sabores, numa regra configurável",
        "Um único laço de animação que dorme quando nada se mexe; sem WebGL ou com “reduzir movimento”, cai sozinho para 2D",
        "Testes da API e das regras de preço com node:test",
      ],
      prova: "API e regras de preço testadas com node:test",
    },
    en: {
      cliente: "Pizzeria · Palhoça, Brazil",
      tag: "Full stack",
      pitch: "A huge menu and messy WhatsApp orders became a site with a pizza builder, ZIP-code checkout, a database and an owner dashboard.",
      desafio: "Figaro's has 57 savory flavors, 14 sweet pizzas, calzones, lasagnas, esfihas and combos. Orders arrived on WhatsApp with no standard, and the owner had nowhere to change prices or opening hours.",
      feito: [
        "Pizza builder: size, up to 3 flavors drawn as slices, crust and notes",
        "Checkout with address lookup by ZIP code, delivery fee per neighborhood, change and a summary sent to the store's WhatsApp",
        "Express + SQLite server keeping the history of every order and every menu change",
        "Dashboard to add flavors, change prices and hours and watch orders arrive with a sound alert",
        "3D pizza built in code (three.js): slices drop into place and fan out on scroll",
      ],
      decisoes: [
        "Password stored with scrypt and a setup code on first access, so nobody can create the account before the owner",
        "Multi-flavor pizza price uses the average of the flavors, in a configurable rule",
        "A single animation loop that sleeps when nothing moves; without WebGL or with “reduce motion” it falls back to 2D",
        "API and pricing rules tested with node:test",
      ],
      prova: "API and pricing rules tested with node:test",
    },
  },
  {
    slug: "sao-cristovao",
    nome: "São Cristóvão 3.0",
    repo: "sao-cristovao-3.0",
    shot: "saocristovao",
    longa: true,
    stack: ["React 19", "TypeScript", "Vite 8", "Tailwind 4", "Express", "Gemini"],
    cor: "#f2c14e",
    evolucao: [
      { v: "1.0", repo: "s-o-cristovao", txt: { pt: "Smash burgers, carrinho persistente e estúdio de imagens com Gemini.", en: "Smash burgers, a persistent cart and an image studio with Gemini." } },
      { v: "3.0", repo: "sao-cristovao-3.0", txt: { pt: "React 19 + TypeScript, burger na rolagem e atendente que monta o pedido.", en: "React 19 + TypeScript, a scroll-driven burger and an assistant that builds the order." } },
    ],
    pt: {
      cliente: "Hamburgueria · Palhoça/SC",
      tag: "React + TS + IA",
      pitch: "Cardápio digital com burger que se desmonta na rolagem e um atendente de IA que entende o pedido escrito do jeito que o cliente fala.",
      desafio: "A loja vende pelo iFood, mas o cliente se perdia entre o cardápio e o app sem saber o que pedir para quantas pessoas.",
      feito: [
        "Hero com o burger em tela cheia controlado pela rolagem (sequência de quadros em canvas, funciona no iPhone)",
        "Atendente que entende frases como “combo para casal”, monta o carrinho e leva ao checkout",
        "Cardápio em abas, filtro “para quantas pessoas” nos combos e busca com contagem por aba",
        "Carrinho persistente que vira um resumo copiável para pedir no iFood",
      ],
      decisoes: [
        "O iFood não aceita carrinho vindo de outro site, então o carrinho vira resumo copiável",
        "O site não coleta nome, telefone, endereço nem pagamento: menos risco e menos LGPD",
        "Com GEMINI_API_KEY quem responde é o Gemini; sem servidor, um atendente local responde sozinho",
        "10 arquivos de testes: pedidos, horários, consentimento e headers de segurança",
      ],
      prova: "10 arquivos de teste no repositório",
    },
    en: {
      cliente: "Burger joint · Palhoça, Brazil",
      tag: "React + TS + AI",
      pitch: "Digital menu with a burger that comes apart on scroll and an AI assistant that understands orders written the way customers talk.",
      desafio: "The store sells through iFood, but customers got lost between the menu and the app, unsure what to order for how many people.",
      feito: [
        "Full-screen burger hero driven by scroll (canvas frame sequence, works on iPhone)",
        "Assistant that understands phrases like “combo for a couple”, fills the cart and goes to checkout",
        "Tabbed menu, “for how many people” filter on combos and search with per-tab counts",
        "Persistent cart that becomes a copyable summary to order on iFood",
      ],
      decisoes: [
        "iFood doesn't accept carts from other sites, so the cart becomes a copyable summary",
        "The site collects no name, phone, address or payment: less risk and less LGPD (Brazil's GDPR) exposure",
        "With GEMINI_API_KEY Gemini answers; without a server, a local assistant answers on its own",
        "10 test files: orders, opening hours, consent and security headers",
      ],
      prova: "10 test files in the repository",
    },
  },
  {
    slug: "smartech",
    nome: "Smartech 3.0",
    repo: "smartech-3.0",
    shot: "smartech",
    longa: true,
    stack: ["three.js", "GSAP", "Gemini API", "JavaScript", "node:test"],
    cor: "#9ec5ff",
    evolucao: [
      { v: "1.0", repo: "smartech", txt: { pt: "Site institucional com Tailwind explicando a tecnologia UV-C.", en: "Company site in Tailwind explaining the UV-C technology." } },
      { v: "2.0", repo: "smartech-2.0", txt: { pt: "Sem build, temas claro e escuro, calculadora testável e SRI.", en: "No build step, light and dark themes, a testable calculator and SRI." } },
      { v: "3.0", repo: "smartech-3.0", txt: { pt: "Showroom 3D com Raio-X, calculadora NBR 14518 e consultor com IA.", en: "3D showroom with X-ray mode, NBR 14518 calculator and an AI consultant." } },
    ],
    pt: {
      cliente: "Coifas industriais UV-C · Florianópolis",
      tag: "3D + IA",
      pitch: "Um produto técnico difícil de explicar virou um showroom 3D com Raio-X, calculadora pela norma e um consultor com IA.",
      desafio: "A Smartech fabrica coifas em inox com lâmpadas UV-C. Foto não mostra o que tem dentro, e o cliente precisa calcular vazão e exaustor antes de pedir orçamento.",
      feito: [
        "Showroom 3D com modo Raio-X, vistas em corte, hotspots clicáveis e ficha técnica de cada peça",
        "Calculadora em tempo real pela NBR 14518: vazão, diâmetro do duto, potência do exaustor e lâmpadas UV-C",
        "Consultor técnico com Gemini e busca do Google; sem o servidor, responde por uma base local",
        "Guia em áudio sobre a física da ozonólise (Gemini TTS ou voz do navegador)",
      ],
      decisoes: [
        "Materiais já nascem transparentes com opacidade 1, assim a troca para Raio-X não recompila shader",
        "Ordem de renderização fixa entre carcaça e peças internas para o Raio-X não piscar",
        "Bibliotecas de CDN com versão fixa e verificação SRI; um único arquivo de configuração",
        "Regras da calculadora em funções puras, com testes",
      ],
      prova: "Regras da calculadora em funções puras, com testes",
    },
    en: {
      cliente: "UV-C industrial hoods · Florianópolis",
      tag: "3D + AI",
      pitch: "A technical product that was hard to explain became a 3D showroom with X-ray mode, a standards-based calculator and an AI consultant.",
      desafio: "Smartech builds stainless-steel kitchen hoods with UV-C lamps. Photos don't show what's inside, and customers must size airflow and exhaust fans before asking for a quote.",
      feito: [
        "3D showroom with X-ray mode, cutaway views, clickable hotspots and a spec sheet for each part",
        "Real-time calculator following NBR 14518: airflow, duct diameter, fan power and UV-C lamps",
        "Technical consultant with Gemini and Google Search; without the server it answers from a local knowledge base",
        "Audio guide on the physics of ozonolysis (Gemini TTS or the browser's voice)",
      ],
      decisoes: [
        "Materials start transparent with opacity 1, so switching to X-ray doesn't recompile shaders",
        "Fixed render order between the housing and inner parts so the X-ray doesn't flicker",
        "CDN libraries pinned to exact versions with SRI checks; a single config file",
        "Calculator rules as pure functions, with tests",
      ],
      prova: "Calculator rules as pure functions, with tests",
    },
  },
  {
    slug: "ingrid",
    nome: "Ingrid Lima",
    repo: "ingrid-market",
    shot: "ingrid",
    stack: ["WebGL", "GLSL", "GSAP 3.13", "JavaScript", "Sem build"],
    cor: "#d9a7ff",
    pt: {
      cliente: "Videomaker e social media",
      tag: "WebGL",
      pitch: "Landing page cujo herói é um olho realista feito só com shader: segue o mouse, pisca e guia a rolagem até o WhatsApp.",
      desafio: "Uma profissional de vídeo precisava de um site que chamasse atenção logo de cara e transformasse visita em contato no WhatsApp.",
      feito: [
        "Olho realista desenhado inteiramente em WebGL: íris com fibras, pele com relevo e delineado, sem nenhuma imagem",
        "Segue o mouse e o dedo, pisca sozinho, reage ao clique e cochila quando ninguém mexe",
        "Mergulho guiado pela rolagem com visor de câmera (REC, cronômetro e foco) dentro da pupila",
        "Portfólio com 9 vídeos verticais e player em tela cheia",
      ],
      decisoes: [
        "Vídeos só carregam quando aparecem, no máximo 2 tocam juntos e respeitam a economia de dados",
        "O WebGL limita a densidade de pixels, reduz a resolução se o aparelho não acompanhar e pausa fora da tela",
        "Sem WebGL entra um olho feito em CSS, no mesmo estilo",
        "Testado em 375, 961 e 1440 px, sem rolagem horizontal e sem erros no console",
      ],
      prova: "Testado em 375, 961 e 1440 px, sem erros no console",
    },
    en: {
      cliente: "Videomaker and social media",
      tag: "WebGL",
      pitch: "A landing page whose hero is a realistic eye made only with a shader: it follows the mouse, blinks and guides the scroll to WhatsApp.",
      desafio: "A video professional needed a site that grabbed attention right away and turned visits into WhatsApp contacts.",
      feito: [
        "Realistic eye drawn entirely in WebGL: fibrous iris, textured skin and eyeliner, no images at all",
        "Follows mouse and finger, blinks on its own, reacts to clicks and dozes off when idle",
        "Scroll-driven dive with a camera viewfinder (REC, timer and focus) inside the pupil",
        "Portfolio with 9 vertical videos and a full-screen player",
      ],
      decisoes: [
        "Videos load only when visible, at most 2 play at once and data-saver is respected",
        "WebGL caps pixel density, lowers resolution if the device can't keep up and pauses off-screen",
        "Without WebGL a CSS eye takes over, in the same style",
        "Tested at 375, 961 and 1440 px, with no horizontal scroll and no console errors",
      ],
      prova: "Tested at 375, 961 and 1440 px, no console errors",
    },
  },
  {
    slug: "cs-store",
    nome: "CS Store",
    repo: "csiphone",
    shot: "csstore",
    stack: ["HTML", "Tailwind CSS", "JavaScript", "three.js"],
    cor: "#c9ccd6",
    pt: {
      cliente: "Loja de iPhones · Palhoça/SC",
      tag: "Showroom 3D",
      pitch: "Loja de iPhones novos e seminovos com showroom 3D, catálogo, calculadora de troca e atendimento direto no WhatsApp.",
      desafio: "A loja precisava de um site que passasse confiança para vender aparelhos caros, mostrar o catálogo e simular a troca do celular antigo.",
      feito: [
        "Showroom 3D interativo e catálogo de iPhones",
        "Calculadora CS Trade-In para simular a troca",
        "Seções de loja física, avaliações e FAQ",
        "Menu mobile e animações que entram ao rolar",
      ],
      decisoes: [
        "Paleta própria em Tailwind (grafite, titânio e dourado) configurada no tema",
        "Animações por IntersectionObserver, leves e sem biblioteca",
        "Site de um arquivo só, publicado no GitHub Pages",
      ],
      prova: "Site de um arquivo só, publicado no GitHub Pages",
    },
    en: {
      cliente: "iPhone store · Palhoça, Brazil",
      tag: "3D showroom",
      pitch: "New and pre-owned iPhone store with a 3D showroom, catalog, trade-in calculator and direct WhatsApp support.",
      desafio: "The store needed a site that built trust to sell expensive devices, showed the catalog and simulated trading in an old phone.",
      feito: [
        "Interactive 3D showroom and iPhone catalog",
        "CS Trade-In calculator to simulate a trade",
        "Sections for the physical store, reviews and FAQ",
        "Mobile menu and scroll-in animations",
      ],
      decisoes: [
        "Custom Tailwind palette (graphite, titanium and gold) set in the theme",
        "Animations via IntersectionObserver, lightweight and library-free",
        "Single-file site published on GitHub Pages",
      ],
      prova: "Single-file site published on GitHub Pages",
    },
  },
];

/* ----- Arquivo: todos os repositórios públicos -----
   c: negocio (cliente) · sistema (cliente com back-end) · fmp (faculdade) · inicio (estudo) · pessoal */
export type Repo = {
  n: string; // nome do repositório
  t: string; // título
  te?: string; // título em inglês, se mudar
  d: string;
  de: string;
  l: string; // linguagem principal
  c: "negocio" | "sistema" | "fmp" | "inicio" | "pessoal";
  at: string; // última atualização (AAAA-MM-DD)
  pages: boolean; // tem site no GitHub Pages
  tags: string;
  novo?: boolean; // marcado pela API do GitHub
};

export const REPOS: Repo[] = [
  { n: "leadpagecarlos", t: "Portfólio carlos@serra", te: "carlos@serra portfolio", d: "O portfólio anterior: HTML, CSS e JavaScript com ilha React, vitrine 3D em three.js, CSP e testes com Playwright.", de: "The previous portfolio: HTML, CSS and JavaScript with a React island, a three.js 3D showcase, CSP and Playwright tests.", l: "JavaScript", c: "pessoal", at: "2026-10-17", pages: true, tags: "react three 3d webgl playwright" },
  { n: "ingrid-market", t: "Ingrid Lima · Videomaker", d: "Landing page com olho realista em WebGL que guia a rolagem e portfólio em vídeo vertical.", de: "Landing page with a realistic WebGL eye that guides the scroll and a vertical video portfolio.", l: "JavaScript", c: "negocio", at: "2026-10-16", pages: true, tags: "webgl shader gsap landing" },
  { n: "Figarus-2.0", t: "Figaro's Pizzaria 2.0", d: "Visual “Futurismo Quente”: tema escuro, vidro, brilho de brasa e animações ao rolar. Pedidos, banco de dados e painel.", de: "“Warm Futurism” look: dark theme, glass, ember glow and scroll animations. Orders, database and dashboard.", l: "JavaScript", c: "sistema", at: "2026-10-14", pages: true, tags: "node express sqlite three 3d pizza" },
  { n: "sao-cristovao-3.0", t: "São Cristóvão 3.0", d: "Cardápio digital com hero guiado pela rolagem, abas e atendente de pedidos com IA.", de: "Digital menu with a scroll-driven hero, tabs and an AI ordering assistant.", l: "TypeScript", c: "sistema", at: "2026-10-11", pages: true, tags: "react typescript vite tailwind gemini ia ai burger" },
  { n: "s-o-cristovao", t: "São Cristóvão Burger", d: "Primeira versão: smash burgers, carrinho persistente, assistente gastronômico e estúdio de imagens com Gemini.", de: "First version: smash burgers, persistent cart, food assistant and an image studio with Gemini.", l: "TypeScript", c: "sistema", at: "2026-10-08", pages: true, tags: "react typescript gemini ia ai burger" },
  { n: "Figaros-Pizzaria", t: "Figaro's Pizzaria", d: "Cardápio completo, montador de pizza, checkout com CEP, SQLite e painel do desenvolvedor com senha.", de: "Full menu, pizza builder, ZIP-code checkout, SQLite and a password-protected developer dashboard.", l: "JavaScript", c: "sistema", at: "2026-10-08", pages: true, tags: "node express sqlite three 3d pizza" },
  { n: "smartech-3.0", t: "Smartech 3.0", d: "Showroom 3D de coifas UV-C (Raio-X, corte e ficha técnica), calculadora NBR 14518, guia de áudio e consultor com IA.", de: "3D showroom for UV-C hoods (X-ray, cutaway and spec sheet), NBR 14518 calculator, audio guide and AI consultant.", l: "JavaScript", c: "negocio", at: "2026-10-07", pages: true, tags: "three 3d gsap gemini ia ai calculadora calculator" },
  { n: "smartech-2.0", t: "Smartech 2.0", d: "Site institucional sem build: temas claro e escuro, calculadora testável e GSAP com bibliotecas verificadas por SRI.", de: "No-build company site: light and dark themes, testable calculator and GSAP with SRI-verified libraries.", l: "JavaScript", c: "negocio", at: "2026-10-06", pages: true, tags: "gsap three calculadora calculator" },
  { n: "smartech", t: "Smartech Coifas", d: "Primeira versão do site da Smartech: coifas industriais e tecnologia UV-C.", de: "First version of the Smartech site: industrial hoods and UV-C technology.", l: "HTML", c: "negocio", at: "2026-10-05", pages: true, tags: "tailwind institucional" },
  { n: "csiphone", t: "CS Store", d: "Loja de iPhones em Palhoça com showroom 3D, catálogo, calculadora de troca e FAQ.", de: "iPhone store in Palhoça with a 3D showroom, catalog, trade-in calculator and FAQ.", l: "HTML", c: "negocio", at: "2026-10-01", pages: true, tags: "tailwind loja store ecommerce three 3d" },
  { n: "Exerc-cio-3-P-gina-tem-tica-completa", t: "Página temática completa", te: "Full theme page", d: "Exercício da FMP: página completa sobre o anime Jujutsu Kaisen.", de: "FMP exercise: a full page about the anime Jujutsu Kaisen.", l: "HTML", c: "fmp", at: "2026-09-17", pages: true, tags: "exercicio exercise anime" },
  { n: "Exerc-cio-2-P-gina-de-divulga-o-de-um-lugar", t: "Conheça Florianópolis", te: "Discover Florianópolis", d: "Exercício da FMP: página de divulgação de um lugar.", de: "FMP exercise: a page promoting a place.", l: "HTML", c: "fmp", at: "2026-09-17", pages: true, tags: "exercicio exercise turismo travel" },
  { n: "Exerc-cio-1-P-gina-de-apresenta-o-pessoal", t: "Apresentação pessoal", te: "Personal introduction", d: "Exercício da FMP: apresentação com vídeo de fundo em loop.", de: "FMP exercise: an introduction page with a looping background video.", l: "HTML", c: "fmp", at: "2026-09-17", pages: true, tags: "exercicio exercise video" },
  { n: "pizzaria", t: "Pizzaria do Michelangelo", d: "Primeiro site para um negócio: fundo animado, cardápio e seção sobre.", de: "First site for a business: animated background, menu and an about section.", l: "HTML", c: "inicio", at: "2026-09-03", pages: true, tags: "pizza" },
  { n: "paginacomimagem", t: "Página com imagem", te: "Page with images", d: "Três páginas ligadas entre si, com imagem e link para o currículo publicado.", de: "Three linked pages with images and a link to the published résumé.", l: "HTML", c: "inicio", at: "2026-08-27", pages: true, tags: "html" },
  { n: "Trabalho-web", t: "Trabalho web", te: "Web assignment", d: "Trabalho de faculdade com navegação entre três páginas.", de: "College assignment with navigation between three pages.", l: "HTML", c: "fmp", at: "2026-08-27", pages: true, tags: "html exercicio exercise" },
  { n: "meu-primeiro-site", t: "Meu primeiro site", te: "My first site", d: "TechNova: o primeiro site, com menu fixo e rolagem suave. Descrição do repositório: “boa sorte carlos”.", de: "TechNova: the very first site, with a fixed menu and smooth scrolling. Repo description: “boa sorte carlos” (good luck, Carlos).", l: "HTML", c: "inicio", at: "2026-08-20", pages: true, tags: "html css" },
  { n: "hello-word-versao-2", t: "Alunos de ADS", te: "ADS students", d: "Página sobre o curso de Análise e Desenvolvimento de Sistemas e o perfil dos alunos.", de: "Page about the Systems Analysis and Development course and its students.", l: "HTML", c: "inicio", at: "2026-08-20", pages: true, tags: "html ads" },
  { n: "curriculumprogramador", t: "Currículo (HTML)", te: "Résumé (HTML)", d: "Modelo de currículo em HTML e CSS, publicado no GitHub Pages.", de: "Résumé template in HTML and CSS, published on GitHub Pages.", l: "HTML", c: "inicio", at: "2026-08-20", pages: true, tags: "curriculo resume" },
  { n: "Curriculum-programador", t: "Curriculum-programador", d: "Repositório criado para o currículo; ainda vazio.", de: "Repository created for the résumé; still empty.", l: "", c: "inicio", at: "2026-08-20", pages: false, tags: "curriculo resume" },
];

/* ----- Serviços: pacotes para vender sites -----
   precoInicial: "" mostra "Sob consulta". Ex.: "R$ 900". Nunca invente valor. */
export type Pacote = {
  id: "landing" | "site" | "loja" | "sistema";
  icone: "Rocket" | "Building2" | "ShoppingBag" | "LayoutDashboard";
  precoInicial: string;
  nome: Txt;
  resumo: Txt;
  inclui: TxtList;
  exemplo: string; // slug de um projeto parecido
};

export const PACOTES: Pacote[] = [
  {
    id: "landing", icone: "Rocket", precoInicial: "", exemplo: "ingrid",
    nome: { pt: "Landing page", en: "Landing page" },
    resumo: { pt: "Uma página que apresenta o seu negócio e leva direto para o WhatsApp.", en: "One page that presents your business and leads straight to WhatsApp." },
    inclui: { pt: ["Uma página completa", "Botão e mensagem pronta no WhatsApp", "Formulário de contato", "Animações e versão para celular"], en: ["One complete page", "WhatsApp button with a ready message", "Contact form", "Animations and a mobile version"] },
  },
  {
    id: "site", icone: "Building2", precoInicial: "", exemplo: "smartech",
    nome: { pt: "Site institucional", en: "Company website" },
    resumo: { pt: "Várias páginas para mostrar serviços, equipe e onde te encontrar.", en: "Several pages to show services, team and where to find you." },
    inclui: { pt: ["Várias páginas", "SEO para aparecer no Google", "Mapa do Google e horários", "Textos e fotos organizados"], en: ["Multiple pages", "SEO to show up on Google", "Google Maps and opening hours", "Organized copy and photos"] },
  },
  {
    id: "loja", icone: "ShoppingBag", precoInicial: "", exemplo: "cs-store",
    nome: { pt: "Loja ou catálogo", en: "Store or catalog" },
    resumo: { pt: "Seus produtos com fotos e preços, e o pedido chegando pelo WhatsApp.", en: "Your products with photos and prices, with orders arriving on WhatsApp." },
    inclui: { pt: ["Catálogo de produtos", "Carrinho ou pedido pelo WhatsApp", "Busca e categorias", "Fácil de atualizar"], en: ["Product catalog", "Cart or WhatsApp ordering", "Search and categories", "Easy to update"] },
  },
  {
    id: "sistema", icone: "LayoutDashboard", precoInicial: "", exemplo: "figaros",
    nome: { pt: "Sistema com painel", en: "System with a dashboard" },
    resumo: { pt: "Login, banco de dados e uma área só sua para controlar pedidos, preços e horários.", en: "Login, a database and your own area to manage orders, prices and hours." },
    inclui: { pt: ["Login com senha protegida", "Banco de dados", "Painel do dono", "Histórico de pedidos e mudanças"], en: ["Login with a protected password", "Database", "Owner dashboard", "Order and change history"] },
  },
];

export const DIFERENCIAIS: TxtList = {
  pt: [
    "Código próprio, sem construtor de sites",
    "Site rápido, medido no Lighthouse",
    "Acessível: teclado, leitor de tela e contraste",
    "Publicação e configuração do domínio",
    "Pedido ou contato direto no WhatsApp",
    "Suporte depois de publicado",
  ],
  en: [
    "Hand-written code, no site builder",
    "Fast site, measured with Lighthouse",
    "Accessible: keyboard, screen reader and contrast",
    "Publishing and domain setup",
    "Orders or contact straight to WhatsApp",
    "Support after launch",
  ],
};

/* ----- Processo ----- */
export const PROCESSO: { titulo: Txt; texto: Txt }[] = [
  { titulo: { pt: "Conversa", en: "Talk" }, texto: { pt: "Entendo o seu negócio, quem é o seu cliente e o que o site precisa resolver.", en: "I learn about your business, your customers and what the site has to solve." } },
  { titulo: { pt: "Proposta", en: "Proposal" }, texto: { pt: "Você recebe o escopo, o prazo e o valor por escrito, antes de começar.", en: "You get the scope, timeline and price in writing before anything starts." } },
  { titulo: { pt: "Design", en: "Design" }, texto: { pt: "Defino visual, textos e estrutura com você, a partir de referências reais.", en: "We define the look, copy and structure together, based on real references." } },
  { titulo: { pt: "Desenvolvimento", en: "Build" }, texto: { pt: "Programo, testo no celular e no computador e mostro as versões no ar.", en: "I code it, test it on phone and desktop and show you live previews." } },
  { titulo: { pt: "Publicação e suporte", en: "Launch and support" }, texto: { pt: "O site vai ao ar no seu domínio e eu continuo por perto para ajustes.", en: "The site goes live on your domain and I stay around for adjustments." } },
];

/* ----- Stack: cada área aponta para um projeto onde dá para conferir ----- */
export type AreaStack = { id: string; titulo: Txt; techs: string[]; prova: string; detalhe: Txt };
export const STACK: AreaStack[] = [
  { id: "front", titulo: { pt: "Front-end", en: "Front-end" }, techs: ["HTML", "CSS", "JavaScript", "TypeScript", "React 19", "Vite", "Tailwind"], prova: "sao-cristovao-3.0", detalhe: { pt: "Componentes em React 19 com TypeScript estrito.", en: "React 19 components with strict TypeScript." } },
  { id: "back", titulo: { pt: "Back-end", en: "Back-end" }, techs: ["Node.js", "Express 5", "SQLite", "API REST", "scrypt"], prova: "Figarus-2.0", detalhe: { pt: "API, banco de dados e senhas com scrypt.", en: "API, database and scrypt password hashing." } },
  { id: "3d", titulo: { pt: "3D e animação", en: "3D and motion" }, techs: ["three.js", "WebGL", "GLSL", "GSAP", "Lenis"], prova: "smartech-3.0", detalhe: { pt: "Cenas 3D, shaders e animação guiada pela rolagem.", en: "3D scenes, shaders and scroll-driven motion." } },
  { id: "ia", titulo: { pt: "IA aplicada", en: "Applied AI" }, techs: ["Gemini API", "TTS", "Busca do Google", "Resposta local"], prova: "sao-cristovao-3.0", detalhe: { pt: "Gemini (texto e voz), com resposta local quando não há chave.", en: "Gemini (text and voice), with a local fallback when there's no key." } },
  { id: "qualidade", titulo: { pt: "Qualidade", en: "Quality" }, techs: ["node:test", "Playwright", "Lighthouse", "CSP", "Acessibilidade"], prova: "Figarus-2.0", detalhe: { pt: "Testes, CSP, acessibilidade e verificação automática.", en: "Tests, CSP, accessibility and automated checks." } },
  { id: "ferramentas", titulo: { pt: "Ferramentas", en: "Tools" }, techs: ["Git", "GitHub Actions", "GitHub Pages", "VS Code", "Claude Code"], prova: "leadpagecarlos2.0", detalhe: { pt: "Versionamento, CI e publicação contínua.", en: "Version control, CI and continuous delivery." } },
];

/* ----- Sobre ----- */
export const TRAJETORIA: { data: Txt; titulo: Txt; texto: Txt }[] = [
  { data: { pt: "20 ago", en: "Aug 20" }, titulo: { pt: "Primeiro commit", en: "First commit" }, texto: { pt: "Um currículo em HTML e a página dos alunos de ADS.", en: "An HTML résumé and a page for my ADS classmates." } },
  { data: { pt: "1 out", en: "Oct 1" }, titulo: { pt: "Primeira loja real", en: "First real store" }, texto: { pt: "CS Store: catálogo de iPhones, showroom 3D e calculadora de troca.", en: "CS Store: iPhone catalog, 3D showroom and trade-in calculator." } },
  { data: { pt: "5–7 out", en: "Oct 5–7" }, titulo: { pt: "Smartech 1.0 → 3.0", en: "Smartech 1.0 → 3.0" }, texto: { pt: "Três versões em três dias, até o showroom 3D com Raio-X.", en: "Three versions in three days, up to the 3D showroom with X-ray mode." } },
  { data: { pt: "8 out", en: "Oct 8" }, titulo: { pt: "Primeiro sistema com banco de dados", en: "First system with a database" }, texto: { pt: "Figaro's: Express, SQLite e painel do dono com login.", en: "Figaro's: Express, SQLite and an owner dashboard with login." } },
  { data: { pt: "11 out", en: "Oct 11" }, titulo: { pt: "React + TypeScript + IA", en: "React + TypeScript + AI" }, texto: { pt: "São Cristóvão 3.0: atendente que monta o pedido e 10 arquivos de teste.", en: "São Cristóvão 3.0: an assistant that builds the order, and 10 test files." } },
];

/* Depoimentos: só entram textos reais, com autorização. Vazio = a seção some. */
export const DEPOIMENTOS: { nome: string; negocio: string; texto: Txt }[] = [];

/* ----- Resumo pronto para o ATS / e-mail do recrutador ----- */
export const resumoATS = (lang: Lang) => {
  const extra = [CONFIG.linkedin && `LinkedIn: ${CONFIG.linkedin}`, CONFIG.curriculo && `${lang === "pt" ? "Currículo" : "Résumé"}: ${CONFIG.curriculo}`]
    .filter(Boolean)
    .join("\n");
  const total = REPOS.length;
  return lang === "pt"
    ? `Carlos Serra · Desenvolvedor Full Stack Júnior · Palhoça/SC
Disponível para estágio ou vaga júnior (presencial, híbrido ou remoto).
Formação: Análise e Desenvolvimento de Sistemas, FMP (Faculdade Municipal de Palhoça), 2ª fase.
Stack: JavaScript, TypeScript, React 19, Vite, Tailwind, Node.js, Express 5, SQLite, three.js, WebGL, GSAP, Gemini API, node:test.
Números: ${CONFIG.numeros.clientes} clientes reais, ${CONFIG.numeros.sites} sites no ar, ${total} repositórios públicos.
Destaques: Figaro's Pizzaria 2.0 (Express + SQLite + painel), São Cristóvão 3.0 (React + TypeScript + IA), Smartech 3.0 (3D + calculadora NBR 14518).
Portfólio: ${CONFIG.siteUrl}
GitHub: ${ghLink()}
E-mail: ${CONFIG.email} · WhatsApp: ${CONFIG.telefone}${extra ? `\n${extra}` : ""}`
    : `Carlos Serra · Junior Full Stack Developer · Palhoça, Brazil
Available for an internship or junior role (on-site, hybrid or remote).
Education: Systems Analysis and Development (ADS), FMP – Faculdade Municipal de Palhoça, 2nd term.
Stack: JavaScript, TypeScript, React 19, Vite, Tailwind, Node.js, Express 5, SQLite, three.js, WebGL, GSAP, Gemini API, node:test.
Numbers: ${CONFIG.numeros.clientes} real clients, ${CONFIG.numeros.sites} live sites, ${total} public repositories.
Highlights: Figaro's Pizzaria 2.0 (Express + SQLite + dashboard), São Cristóvão 3.0 (React + TypeScript + AI), Smartech 3.0 (3D + NBR 14518 calculator).
Portfolio: ${CONFIG.siteUrl}
GitHub: ${ghLink()}
Email: ${CONFIG.email} · WhatsApp: +55 48 99617-0281${extra ? `\n${extra}` : ""}`;
};

/* ----- Textos da interface ----- */
const pt = {
  meta: {
    title: "Carlos Serra · Desenvolvedor Full Stack Júnior",
    desc: "Carlos Serra, desenvolvedor full stack júnior em Palhoça, SC. Sites e sistemas que puxam clientes direto para o seu WhatsApp, com 3D, banco de dados e IA. Disponível para estágio e vaga júnior.",
  },
  skip: "Pular para o conteúdo",
  nav: { inicio: "Início", projetos: "Projetos", servicos: "Serviços", sobre: "Sobre", contato: "Contato", label: "Seções", menu: "Abrir menu", fechar: "Fechar menu", home: "Carlos Serra, início" },
  lang: { btn: "EN", label: "Read in English" },
  cta: { wa: "Chamar no WhatsApp", waShort: "WhatsApp" },
  loader: { carregando: "Entrando na órbita", pular: "Clique, role ou aperte uma tecla para pular" },
  hero: {
    badge: "Disponível para estágio, vaga júnior e novos projetos",
    role: "Desenvolvedor Full Stack Júnior",
    tagline: "A gravidade inevitável do seu negócio",
    sub: "Sites e sistemas que puxam clientes direto para o seu WhatsApp, com 3D, banco de dados e IA quando faz sentido.",
    ctaSite: "Quero um site",
    ctaProj: "Ver projetos",
    ctaRec: "Sou recrutador",
    n1: "clientes reais",
    n2: "sites no ar",
    n3: "repositórios",
    scroll: "Role para atravessar",
    hora: "Brasília",
  },
  projetos: {
    k: "Galáxia de projetos",
    t: "Clientes reais, do pedido ao site no ar",
    p: "Cada monólito é um projeto. Role para girar a órbita, clique para abrir o estudo de caso.",
    desafio: "Desafio",
    feito: "O que eu fiz",
    stack: "Stack",
    live: "Site no ar",
    code: "Código",
    caso: "Estudo de caso",
    prev: "Projeto anterior",
    next: "Próximo projeto",
    de: "de",
    dica: "← → para navegar",
    arraste: "Arraste para o lado",
  },
  caso: {
    fechar: "Fechar estudo de caso",
    desafio: "Desafio",
    solucao: "O que eu fiz",
    decisoes: "Decisões técnicas",
    conferir: "Como conferir",
    evolucao: "Evolução",
    stack: "Stack",
    computador: "Computador",
    celular: "Celular",
    paginaInteira: "Página inteira",
    captura: "Captura de tela do site",
  },
  arquivo: {
    t: "Arquivo",
    p: "Tudo o que eu publiquei no GitHub, do primeiro commit ao projeto mais novo.",
    filtros: "Filtrar repositórios",
    filters: { all: "Todos", clientes: "Clientes", "3d": "3D e WebGL", ia: "IA", react: "React e TS", back: "Back-end", estudos: "Estudos" },
    kinds: { negocio: "cliente", sistema: "sistema", fmp: "faculdade", inicio: "estudo", pessoal: "portfólio" },
    mais: (n: number) => `Mostrar todos (${n})`,
    menos: "Mostrar menos",
    vazio: "Nada com esse filtro ainda.",
    novo: "novo",
    novoDesc: "Projeto novo no GitHub.",
    site: "Site",
    codigo: "Código",
  },
  servicos: {
    k: "Serviços",
    t: "O que eu faço pelo seu negócio",
    p: "Escolha um ponto de partida. Cada site é feito do zero para o seu cliente, com o pedido ou o contato indo direto para o seu WhatsApp.",
    aPartir: "a partir de",
    consulta: "Sob consulta",
    exemplo: "Exemplo real",
    pedir: "Quero este",
    dif: "Em todo projeto",
  },
  processo: { k: "Processo", t: "Do primeiro oi ao site no ar", p: "Cinco etapas, sem surpresa no meio do caminho." },
  stack: { k: "Stack", t: "O que eu uso, com prova", p: "Cada constelação aponta para um repositório onde dá para abrir o código e conferir.", ver: "Conferir em" },
  sobre: {
    k: "Sobre",
    t: "Aprendo construindo para clientes reais",
    p1: "Estudo Análise e Desenvolvimento de Sistemas na FMP, em Palhoça. Comecei a programar em agosto de 2026 e, desde então, fiz sites e sistemas que 5 negócios da região usam: cardápio com pedido pelo WhatsApp, painel com login e banco de dados, vitrine em 3D.",
    p2: "Gosto de entender como o negócio funciona antes de abrir o editor. Quero entrar num time onde eu receba code review e cresça em front-end ou full stack.",
    retratoAlt: "Carlos Serra de terno escuro e camisa clara",
    ficha: [
      ["Base", "Palhoça, SC · Grande Florianópolis"],
      ["Formação", "ADS, FMP (2ª fase)"],
      ["Formato", "Presencial, híbrido ou remoto"],
      ["Idiomas", "Português, inglês técnico"],
    ] as [string, string][],
    trajetoria: "Trajetória · 2026",
  },
  recrutador: {
    k: "Sou recrutador",
    t: "Tudo o que você precisa em 30 segundos",
    p: "Currículo, links e um resumo pronto para colar no ATS ou no e-mail.",
    cv: "Currículo (PDF)",
    linkedin: "LinkedIn",
    ats: "Copiar resumo para o ATS",
    email: "Copiar e-mail",
    vcf: "Salvar contato (.vcf)",
    copiado: "Resumo copiado. É só colar no ATS ou no e-mail.",
    emailCopiado: (e: string) => `E-mail copiado: ${e}`,
    falhou: (e: string) => `Selecione e copie: ${e}`,
    vcfOk: "Contato salvo. Abra o arquivo para adicionar à agenda.",
  },
  contato: {
    k: "Contato",
    t: "Vamos construir algo?",
    p: "Estou disponível para estágio ou vaga júnior e também faço sites e sistemas para negócios. Escolha o canal ou monte a mensagem: ela vai pronta.",
    agora: "Agora em Palhoça",
    disponivel: "Disponível agora",
    chWa: "O jeito mais rápido · abre a conversa com a mensagem pronta",
    chEmail: "Para propostas e vagas",
    chGh: "Todo o código, aberto",
    chIn: "Perfil profissional",
    copiar: "Copiar",
    qrT: "Do computador para o celular",
    qrP: "Aponte a câmera para abrir o WhatsApp",
    form: {
      t: "Monte sua mensagem",
      sobre: "Sobre o quê?",
      sobreOps: { vaga: "Vaga ou estágio", projeto: "Site ou sistema", outro: "Outro assunto" },
      tipo: "Tipo de projeto",
      tipoOps: { landing: "Landing page", site: "Site institucional", loja: "Loja ou catálogo", sistema: "Sistema com painel" },
      prazo: "Prazo",
      prazoOps: { calma: "Sem pressa", mes: "Este mês", urgente: "Urgente" },
      orcamento: "Orçamento (opcional)",
      orcamentoOps: { "1": "até R$ 1 mil", "2": "R$ 1 a 3 mil", "3": "acima de R$ 3 mil", "0": "a combinar" },
      nome: "Seu nome",
      empresa: "Empresa (opcional)",
      email: "Seu e-mail (opcional)",
      msg: "Mensagem",
      msgDica: "Algumas linhas bastam: a vaga, o negócio ou a ideia.",
      previa: "Prévia da mensagem",
      enviarWa: "Enviar pelo WhatsApp",
      enviarEmail: "Enviar por e-mail",
      erroNome: "Escreva seu nome.",
      erroMsg: "Escreva uma mensagem com pelo menos 10 caracteres.",
      erroEmail: "Escreva um e-mail válido, como nome@empresa.com.",
      precisaEmail: "Escreva seu e-mail para eu poder responder.",
      abriuWa: "Abri o WhatsApp com a mensagem pronta. É só enviar.",
      abriuEmail: "Abri o seu aplicativo de e-mail com a mensagem pronta.",
      semJs: "Mande uma mensagem no WhatsApp",
    },
    msg: {
      ola: (n: string, o: string) => `Olá, Carlos! Sou ${n || "…"}${o ? `, da ${o}` : ""}.`,
      assunto: "Assunto",
      tipo: "Tipo",
      prazo: "Prazo",
      orcamento: "Orçamento",
      email: "Meu e-mail",
      assina: "(enviado pelo seu site)",
      subject: (n: string) => `Contato pelo site · ${n}`,
      padrao: "Olá, Carlos! Vi seu site e quero conversar.",
    },
  },
  rodape: {
    q: "Pronto para entrar na órbita?",
    p: "Uma vaga, um projeto ou só uma ideia: me chama que eu respondo.",
    btn: "Chamar no WhatsApp",
    mapa: "Mapa do site",
    contatos: "Contatos",
    noAr: "Projetos no ar",
    status: "Status",
    statusV: "Disponível para estágio e vaga júnior",
    codigo: "Código deste site",
    assinatura: "© 2026 Carlos Serra · feito à mão com Next.js, three.js e muito café",
    topo: "Voltar ao topo",
  },
  geral: { abreNovaAba: "abre em nova aba", copiado: (x: string) => `Copiado: ${x}` },
};

type Dict = typeof pt;

const en: Dict = {
  meta: {
    title: "Carlos Serra · Junior Full Stack Developer",
    desc: "Carlos Serra, junior full stack developer in Palhoça, Brazil. Websites and systems that pull customers straight to your WhatsApp, with 3D, databases and AI. Open to internships and junior roles.",
  },
  skip: "Skip to content",
  nav: { inicio: "Home", projetos: "Projects", servicos: "Services", sobre: "About", contato: "Contact", label: "Sections", menu: "Open menu", fechar: "Close menu", home: "Carlos Serra, home" },
  lang: { btn: "PT", label: "Ler em português" },
  cta: { wa: "Message on WhatsApp", waShort: "WhatsApp" },
  loader: { carregando: "Entering orbit", pular: "Click, scroll or press a key to skip" },
  hero: {
    badge: "Open to internships, junior roles and new projects",
    role: "Junior Full Stack Developer",
    tagline: "The inevitable gravity of your business",
    sub: "Websites and systems that pull customers straight to your WhatsApp, with 3D, databases and AI when it makes sense.",
    ctaSite: "I want a website",
    ctaProj: "See projects",
    ctaRec: "I'm a recruiter",
    n1: "real clients",
    n2: "live sites",
    n3: "repositories",
    scroll: "Scroll to cross over",
    hora: "Brasília",
  },
  projetos: {
    k: "Project galaxy",
    t: "Real clients, from request to live site",
    p: "Each monolith is a project. Scroll to turn the orbit, click to open the case study.",
    desafio: "Challenge",
    feito: "What I built",
    stack: "Stack",
    live: "Live site",
    code: "Code",
    caso: "Case study",
    prev: "Previous project",
    next: "Next project",
    de: "of",
    dica: "← → to navigate",
    arraste: "Swipe sideways",
  },
  caso: {
    fechar: "Close case study",
    desafio: "Challenge",
    solucao: "What I built",
    decisoes: "Technical decisions",
    conferir: "How to verify",
    evolucao: "Evolution",
    stack: "Stack",
    computador: "Desktop",
    celular: "Mobile",
    paginaInteira: "Full page",
    captura: "Screenshot of the site",
  },
  arquivo: {
    t: "Archive",
    p: "Everything I've published on GitHub, from the first commit to the newest project.",
    filtros: "Filter repositories",
    filters: { all: "All", clientes: "Clients", "3d": "3D & WebGL", ia: "AI", react: "React & TS", back: "Back-end", estudos: "Studies" },
    kinds: { negocio: "client", sistema: "system", fmp: "college", inicio: "study", pessoal: "portfolio" },
    mais: (n: number) => `Show all (${n})`,
    menos: "Show less",
    vazio: "Nothing with this filter yet.",
    novo: "new",
    novoDesc: "New project on GitHub.",
    site: "Site",
    codigo: "Code",
  },
  servicos: {
    k: "Services",
    t: "What I build for your business",
    p: "Pick a starting point. Every site is built from scratch for your customers, with orders or contacts going straight to your WhatsApp.",
    aPartir: "from",
    consulta: "Price on request",
    exemplo: "Real example",
    pedir: "I want this",
    dif: "In every project",
  },
  processo: { k: "Process", t: "From the first hello to a live site", p: "Five steps, no surprises along the way." },
  stack: { k: "Stack", t: "What I use, with proof", p: "Each constellation points to a repository where you can open the code and check.", ver: "Check it in" },
  sobre: {
    k: "About",
    t: "I learn by building for real clients",
    p1: "I study Systems Analysis and Development at FMP in Palhoça, Brazil. I started coding in August 2026 and since then I've built websites and systems that 5 local businesses use: menus that take WhatsApp orders, a dashboard with login and a database, a 3D showcase.",
    p2: "I like to understand how the business works before opening the editor. I want to join a team where I get code review and grow in front-end or full stack.",
    retratoAlt: "Carlos Serra in a dark suit and a light shirt",
    ficha: [
      ["Based in", "Palhoça, Brazil · Greater Florianópolis"],
      ["Education", "Systems Analysis, FMP (2nd term)"],
      ["Work format", "On-site, hybrid or remote"],
      ["Languages", "Portuguese, technical English"],
    ],
    trajetoria: "Journey · 2026",
  },
  recrutador: {
    k: "I'm a recruiter",
    t: "Everything you need in 30 seconds",
    p: "Résumé, links and a summary ready to paste into your ATS or an email.",
    cv: "Résumé (PDF)",
    linkedin: "LinkedIn",
    ats: "Copy summary for your ATS",
    email: "Copy email",
    vcf: "Save contact (.vcf)",
    copiado: "Summary copied. Paste it into your ATS or an email.",
    emailCopiado: (e: string) => `Email copied: ${e}`,
    falhou: (e: string) => `Select and copy: ${e}`,
    vcfOk: "Contact saved. Open the file to add it to your contacts.",
  },
  contato: {
    k: "Contact",
    t: "Shall we build something?",
    p: "I'm open to an internship or a junior role, and I also build websites and systems for businesses. Pick a channel or put together your message: it goes out ready.",
    agora: "Now in Palhoça",
    disponivel: "Available now",
    chWa: "The fastest way · opens the chat with a message ready",
    chEmail: "For proposals and job offers",
    chGh: "All the code, in the open",
    chIn: "Professional profile",
    copiar: "Copy",
    qrT: "From your computer to your phone",
    qrP: "Point your camera to open WhatsApp",
    form: {
      t: "Put together your message",
      sobre: "What is it about?",
      sobreOps: { vaga: "Job or internship", projeto: "Website or system", outro: "Something else" },
      tipo: "Project type",
      tipoOps: { landing: "Landing page", site: "Company website", loja: "Store or catalog", sistema: "System with a dashboard" },
      prazo: "Timeline",
      prazoOps: { calma: "No rush", mes: "This month", urgente: "Urgent" },
      orcamento: "Budget (optional)",
      orcamentoOps: { "1": "up to R$ 1k", "2": "R$ 1k to 3k", "3": "over R$ 3k", "0": "to be discussed" },
      nome: "Your name",
      empresa: "Company (optional)",
      email: "Your email (optional)",
      msg: "Message",
      msgDica: "A few lines are enough: the role, the business or the idea.",
      previa: "Message preview",
      enviarWa: "Send on WhatsApp",
      enviarEmail: "Send by email",
      erroNome: "Please enter your name.",
      erroMsg: "Please write a message with at least 10 characters.",
      erroEmail: "Please enter a valid email, like name@company.com.",
      precisaEmail: "Please enter your email so I can reply.",
      abriuWa: "WhatsApp opened with your message ready. Just hit send.",
      abriuEmail: "Your email app opened with the message ready.",
      semJs: "Send a message on WhatsApp",
    },
    msg: {
      ola: (n: string, o: string) => `Hi Carlos! I'm ${n || "…"}${o ? ` from ${o}` : ""}.`,
      assunto: "Topic",
      tipo: "Type",
      prazo: "Timeline",
      orcamento: "Budget",
      email: "My email",
      assina: "(sent from your website)",
      subject: (n: string) => `Contact from your website · ${n}`,
      padrao: "Hi Carlos! I saw your website and would like to talk.",
    },
  },
  rodape: {
    q: "Ready to enter the orbit?",
    p: "A job, a project or just an idea: message me and I'll get back to you.",
    btn: "Message on WhatsApp",
    mapa: "Site map",
    contatos: "Contact",
    noAr: "Live projects",
    status: "Status",
    statusV: "Open to internships and junior roles",
    codigo: "Source of this site",
    assinatura: "© 2026 Carlos Serra · hand-built with Next.js, three.js and lots of coffee",
    topo: "Back to top",
  },
  geral: { abreNovaAba: "opens in a new tab", copiado: (x: string) => `Copied: ${x}` },
};

export const TEXTOS: Record<Lang, Dict> = { pt, en };
export type Textos = Dict;
