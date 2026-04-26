"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "demoBannerDismissed";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY);
      setDismissed(v === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  const creds = useMemo(
    () =>
      "NIT Raipur (Issuer): nit@trustchain.demo | Arjun (Student): arjun@trustchain.demo | Google HR (Employer): hr@trustchain.demo | Password for all: demo1234",
    []
  );

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-indigo-200 bg-indigo-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="shrink-0 text-sm font-semibold text-indigo-700">🎯 Demo Mode —</div>
        <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm text-slate-700">
          {creds}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md px-2 py-1 text-slate-700 hover:bg-slate-200/60 hover:text-slate-900"
          aria-label="Dismiss demo banner"
          onClick={() => {
            try {
              sessionStorage.setItem(STORAGE_KEY, "true");
            } catch {}
            setDismissed(true);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

