"use client";

import { forwardRef } from "react";
import { asset } from "@/lib/asset";
import { useMontado } from "@/components/ui/useMontado";

/* Anel do alfabeto gótico (primeira referência do Carlos) girando em volta do horizonte de eventos.
   As letras vêm em contorno de public/hero/anel.svg (gerado por ferramentas/anel.mjs).
   É decorativo: o canvas só ajusta a posição e o tamanho para acompanhar a câmera. */
export const GothicRing = forwardRef<HTMLDivElement>(function GothicRing(_, ref) {
  // o arquivo das letras só é pedido depois da primeira pintura (não disputa banda com o texto)
  const montado = useMontado();
  return (
    <div ref={ref} className="gothic-ring" aria-hidden="true">
      <svg viewBox="0 0 560 560">
        <circle cx="280" cy="280" r="268" fill="none" stroke="rgba(242,193,78,.10)" strokeDasharray="2 7" />
        {montado && <use href={`${asset("/hero/anel.svg")}#anel`} />}
      </svg>
    </div>
  );
});
