"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function extractId(value: string) {
  const v = value.trim();
  if (!v) return "";

  // Accept full links like https://.../verify/<id>
  try {
    if (/^https?:\/\//i.test(v)) {
      const u = new URL(v);
      const parts = u.pathname.split("/").filter(Boolean);
      const verifyIdx = parts.findIndex((p) => p === "verify");
      if (verifyIdx >= 0 && parts[verifyIdx + 1]) return parts[verifyIdx + 1];
    }
  } catch {
    // ignore
  }

  // Accept plain /verify/<id>
  const m = v.match(/\/verify\/([^/?#]+)/i);
  if (m?.[1]) return m[1];

  return v;
}

export function QuickVerify() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const id = useMemo(() => extractId(value), [value]);

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <div className="text-2xl font-bold tracking-tight">Quick Verify</div>
        <div className="mt-2 text-sm text-slate-600">
          Paste a certificate link or ID to instantly verify authenticity
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Certificate ID or /verify/… link"
            className="h-14 pl-12 text-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <Button
          className="h-14 px-8 bg-indigo-600 hover:bg-indigo-600/90 text-white"
          onClick={() => router.push(`/verify/${encodeURIComponent(id)}`)}
          disabled={!id}
        >
          Verify Now
        </Button>
      </div>
    </div>
  );
}

