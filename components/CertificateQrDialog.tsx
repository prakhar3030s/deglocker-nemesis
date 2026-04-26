"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Copy, ExternalLink, Loader2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CertificateQrDialog({
  certificateId,
  open,
  onOpenChange,
}: {
  certificateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // undefined: resolving/not attempted, null: resolve failed, string: resolved base URL
  const [baseUrl, setBaseUrl] = useState<string | null | undefined>(undefined);
  const [resolvingBase, setResolvingBase] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const fallbackOrigin =
    typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";

  const finalBaseUrl = typeof baseUrl === "string" && baseUrl.length > 0 ? baseUrl : fallbackOrigin;
  const fullUrl = useMemo(() => {
    if (!certificateId) return "";
    if (!finalBaseUrl) return "";
    return `${finalBaseUrl.replace(/\/+$/, "")}/verify/${encodeURIComponent(certificateId)}`;
  }, [certificateId, finalBaseUrl]);

  useEffect(() => {
    if (!open) return;
    // Always resolve on open so we don't accidentally show localhost QR first.
    setBaseUrl(undefined);

    let alive = true;
    async function loadBase() {
      setResolvingBase(true);
      try {
        const res = await fetch("/api/meta/base-url", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!alive) return;
        const envOrLan = typeof data?.baseUrl === "string" && data.baseUrl.trim() ? data.baseUrl.trim() : null;
        setBaseUrl(envOrLan);
      } catch {
        if (!alive) return;
        setBaseUrl(null);
      } finally {
        if (!alive) return;
        setResolvingBase(false);
      }
    }
    loadBase();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    let alive = true;
    async function gen() {
      setQrDataUrl(null);
      if (!open) return;
      // Wait for base URL resolution before generating (prevents localhost QR flash).
      if (baseUrl === undefined) return;
      if (!fullUrl) return;
      try {
        const url = await QRCode.toDataURL(fullUrl, {
          margin: 1,
          scale: 8,
          errorCorrectionLevel: "M",
          color: { dark: "#0f172a", light: "#ffffff" },
        });
        if (!alive) return;
        setQrDataUrl(url);
      } catch (e) {
        if (!alive) return;
        setQrDataUrl(null);
      }
    }
    gen();
    return () => {
      alive = false;
    };
  }, [open, fullUrl]);

  const usingFallback = baseUrl === null && !!fallbackOrigin;
  const resolvedToLan = typeof baseUrl === "string" && baseUrl.length > 0;

  async function copyLink() {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan to verify</DialogTitle>
          <DialogDescription>Open on your phone to view verification instantly.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Wifi className="h-4 w-4 text-indigo-600" />
              Make sure your phone is on the same Wi‑Fi.
            </div>
            {usingFallback ? (
              <div className="mt-2 text-xs text-amber-700">
                Using current origin — this may not work from mobile. Set{" "}
                <span className="font-mono">NEXT_PUBLIC_APP_URL</span> to your LAN URL (e.g.{" "}
                <span className="font-mono">http://192.168.x.x:3000</span>).
              </div>
            ) : null}
            {resolvedToLan ? (
              <div className="mt-2 text-xs text-slate-600">
                Using LAN address: <span className="font-mono">{baseUrl}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-center rounded-2xl border bg-white p-4">
            {baseUrl === undefined ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing QR…
              </div>
            ) : qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR code to verify certificate"
                className="h-[240px] w-[240px] rounded-xl"
              />
            ) : (
              <div className="text-sm text-muted-foreground">QR unavailable</div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-3 text-xs text-slate-600 break-all font-mono">{fullUrl || "—"}</div>
        </div>

        <DialogFooter>
          <Button asChild variant="outline" disabled={!fullUrl}>
            <a href={fullUrl || "#"} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </a>
          </Button>
          <Button variant="outline" onClick={copyLink} disabled={!fullUrl}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

