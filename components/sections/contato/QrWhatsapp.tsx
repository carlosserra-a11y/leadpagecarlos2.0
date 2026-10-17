import QRCode from "qrcode";
import { waLink } from "@/lib/dados";

/* QR gerado no build (componente de servidor): nenhum JavaScript vai para o navegador */
export async function QrWhatsapp() {
  const svg = await QRCode.toString(waLink("Olá, Carlos! Vi seu site e quero conversar."), {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#f5f1e8", light: "#00000000" },
  });
  return <div className="size-[132px] [&>svg]:size-full" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
