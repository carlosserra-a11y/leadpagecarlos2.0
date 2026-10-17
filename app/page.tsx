import { CosmicHero } from "@/components/hero/CosmicHero";
import { Projetos } from "@/components/sections/projetos/Projetos";
import { Servicos } from "@/components/sections/Servicos";
import { Processo } from "@/components/sections/Processo";
import { Stack } from "@/components/sections/Stack";
import { Sobre } from "@/components/sections/Sobre";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Contato } from "@/components/sections/contato/Contato";
import { QrWhatsapp } from "@/components/sections/contato/QrWhatsapp";
import { reposNovos } from "@/lib/github";

export default async function Home() {
  const novos = await reposNovos(); // no build
  return (
    <>
      <CosmicHero />
      <Projetos novos={novos} />
      <Servicos />
      <Processo />
      <Stack />
      <Sobre />
      <Depoimentos />
      <Contato qr={<QrWhatsapp />} />
    </>
  );
}
