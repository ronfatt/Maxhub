"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"
    >
      <Download size={17} />
      Print / Save PDF
    </button>
  );
}
