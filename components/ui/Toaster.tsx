"use client";

import { useEffect, useState } from "react";

/* Avisos curtos ("Copiado", "Abri o WhatsApp"). Qualquer parte do site chama toast(). */
export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent<string>("lp2-toast", { detail: msg }));
}

export function Toaster() {
  const [msg, setMsg] = useState("");
  const [id, setId] = useState(0);

  useEffect(() => {
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      setId((n) => n + 1);
    };
    window.addEventListener("lp2-toast", on);
    return () => window.removeEventListener("lp2-toast", on);
  }, []);

  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => setMsg(""), 4200);
    return () => clearTimeout(timer);
  }, [msg, id]);

  return (
    <div className="toast" role="status" aria-live="polite">
      {msg && (
        <p key={id} className="glass rounded-full px-5 py-3 text-sm text-text [animation:caseIn_.5s_var(--ease-out-expo)]">
          {msg}
        </p>
      )}
    </div>
  );
}
