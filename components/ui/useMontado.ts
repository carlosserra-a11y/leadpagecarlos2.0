"use client";

import { useSyncExternalStore } from "react";

const nada = () => () => {};

/** true só no navegador, depois da hidratação (no HTML estático é false) */
export function useMontado() {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
}
