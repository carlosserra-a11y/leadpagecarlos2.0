import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CONFIG, TEXTOS, ghLink } from "@/lib/dados";
import { BASE } from "@/lib/asset";
import { LangProvider } from "@/components/providers/LangProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/layout/Loader";
import { Cursor } from "@/components/layout/Cursor";
import { Toaster } from "@/components/ui/Toaster";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { SkipLink } from "@/components/layout/SkipLink";
import { Cosmos } from "@/components/layout/Cosmos";
import { Parallax } from "@/components/layout/Parallax";

/* Fontes góticas das referências do Carlos, guardadas no repositório (app/fontes, subconjunto latino):
   o build não depende do Google Fonts e o navegador não pede nada a terceiros. */
const cook = localFont({ src: "./fontes/unifrakturcook-700.woff2", weight: "700", variable: "--f-cook", display: "swap", adjustFontFallback: "Times New Roman" });
const consent = localFont({ src: "./fontes/manufacturing-consent-400.woff2", weight: "400", variable: "--f-consent", display: "swap", preload: false, adjustFontFallback: "Times New Roman" });
// só o que aparece logo de cara é pré-carregado (nome em gótica e texto); o resto chega sem bloquear
const grenze = localFont({ src: "./fontes/grenze-gotisch-700.woff2", weight: "700", variable: "--f-grenze", display: "swap", preload: false, adjustFontFallback: "Times New Roman" });
const inter = localFont({ src: "./fontes/inter-var.woff2", weight: "400 700", variable: "--f-inter", display: "swap" });
const mono = localFont({ src: "./fontes/jetbrains-mono-var.woff2", weight: "400 600", variable: "--f-mono", display: "swap", preload: false, adjustFontFallback: false });

const t = TEXTOS.pt;
const URL_SITE = CONFIG.siteUrl;
const OG = `${URL_SITE}og.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: t.meta.title,
  description: t.meta.desc,
  applicationName: "Carlos Serra",
  authors: [{ name: CONFIG.nome, url: ghLink() }],
  creator: CONFIG.nome,
  keywords: ["Carlos Serra", "desenvolvedor full stack júnior", "estágio", "Palhoça", "Florianópolis", "criação de sites", "React", "Next.js", "three.js"],
  alternates: { canonical: URL_SITE },
  openGraph: {
    type: "profile",
    locale: "pt_BR",
    alternateLocale: ["en_US"],
    url: URL_SITE,
    siteName: "Carlos Serra",
    title: t.meta.title,
    description: t.meta.desc,
    images: [{ url: OG, width: 1200, height: 630, alt: "Carlos Serra em letras góticas prateadas sobre um buraco negro" }],
  },
  twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.desc, images: [OG] },
  icons: {
    icon: [
      { url: `${BASE}/marca/favicon.svg`, type: "image/svg+xml" },
      { url: `${BASE}/marca/favicon-32.png`, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: `${BASE}/marca/apple-touch-icon.png`, sizes: "180x180" }],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#02030a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Roda antes da primeira pintura: liga o modo com JS e decide se a intro aparece.
   Tem prazo próprio, para a tela de carregamento nunca prender a página. */
const INICIO = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('lp2-intro')){d.classList.add('carregando');setTimeout(function(){d.classList.remove('carregando')},4000)}}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${URL_SITE}#carlos`,
      name: CONFIG.nome,
      jobTitle: "Desenvolvedor Full Stack Júnior",
      url: URL_SITE,
      image: `${URL_SITE}foto/retrato-560.webp`,
      email: `mailto:${CONFIG.email}`,
      telephone: "+55-48-99617-0281",
      address: { "@type": "PostalAddress", addressLocality: "Palhoça", addressRegion: "SC", addressCountry: "BR" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Faculdade Municipal de Palhoça (FMP)" },
      knowsAbout: ["React", "TypeScript", "Node.js", "Express", "SQLite", "three.js", "WebGL", "Next.js"],
      sameAs: [ghLink(), CONFIG.linkedin].filter(Boolean),
    },
    {
      "@type": "ProfessionalService",
      "@id": `${URL_SITE}#servico`,
      name: "Carlos Serra · Criação de sites e sistemas",
      url: URL_SITE,
      image: `${URL_SITE}og.jpg`,
      founder: { "@id": `${URL_SITE}#carlos` },
      areaServed: [{ "@type": "AdministrativeArea", name: "Grande Florianópolis" }, { "@type": "Country", name: "Brasil" }],
      address: { "@type": "PostalAddress", addressLocality: "Palhoça", addressRegion: "SC", addressCountry: "BR" },
      telephone: "+55-48-99617-0281",
      email: CONFIG.email,
      serviceType: ["Landing page", "Site institucional", "Loja virtual", "Sistema web com painel"],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontes = [cook, consent, grenze, inter, mono].map((f) => f.variable).join(" ");
  return (
    <html lang="pt-BR" className={fontes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INICIO }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Cosmos />
        <LangProvider>
          <SkipLink />
          <Loader />
          <SmoothScroll />
          <Header />
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <Cursor />
          <Toaster />
          <RevealObserver />
          <Parallax />
        </LangProvider>
      </body>
    </html>
  );
}
