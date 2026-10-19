"use client";

import { useLang } from "@/components/providers/LangProvider";

export function SkipLink() {
  const { t } = useLang();
  return (
    <a
      href="#conteudo"
      className="fixed left-4 top-3 z-[200] -translate-y-24 rounded-full bg-silver px-5 py-3 font-semibold text-void no-underline transition-transform focus:translate-y-0"
    >
      {t.skip}
    </a>
  );
}
