"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "./dados";

/** Hora de Palhoça (horário de Brasília). Vazio até montar, para o HTML estático não mentir a hora. */
export function useClock(seconds = false) {
  const [hora, setHora] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      timeZone: CONFIG.fuso,
      hour: "2-digit",
      minute: "2-digit",
      ...(seconds ? { second: "2-digit" } : null),
    });
    const tick = () => setHora(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, seconds ? 1000 : 15000);
    return () => clearInterval(id);
  }, [seconds]);
  return hora;
}
