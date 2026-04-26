"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Award,
  Building2,
  CheckCircle,
  Copy,
  Download,
  FileText,
  Fingerprint,
  ExternalLink,
  QrCode,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CertificateQrDialog } from "@/components/CertificateQrDialog";

type CertificateListItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileHash: string;
  issuedAt: string;
  verified: boolean;
  revoked: boolean;
  blockchainTxId: string | null;
  issuedBy: { id: string; name: string; email: string; orgName: string | null };
  issuedTo: { id: string; name: string; email: string };
};

function initials(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);
  const first = parts[0]?.[0] ?? "S";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function StudentPage() {
  const { data } = useSession();
  const [certs, setCerts] = useState<CertificateListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "verified" | "revoked">("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<CertificateListItem | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCertId, setQrCertId] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/certificates", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load");
      setCerts(data.certificates ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (data?.user?.role) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.role]);

  const user = data?.user;
  const role = user?.role;
  const studentName = user?.name ?? "Student";
  const studentEmail = user?.email ?? "";

  const stats = useMemo(() => {
    const total = certs.length;
    const verifiedCount = certs.filter((c) => !c.revoked).length;
    const institutions = new Set(
      certs.map((c) => (c.issuedBy.orgName ?? c.issuedBy.name ?? "").trim()).filter(Boolean)
    ).size;
    return { total, verifiedCount, institutions };
  }, [certs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return certs.filter((c) => {
      if (tab === "verified" && c.revoked) return false;
      if (tab === "revoked" && !c.revoked) return false;
      if (!needle) return true;
      const issuer = (c.issuedBy.orgName ?? c.issuedBy.name ?? "").toLowerCase();
      return c.title.toLowerCase().includes(needle) || issuer.includes(needle);
    });
  }, [certs, q, tab]);

  if (!user) return <div className="mx-auto max-w-4xl px-4 py-12">Please sign in.</div>;
  if (role !== "STUDENT")
    return <div className="mx-auto max-w-4xl px-4 py-12">Only STUDENT accounts can access this page.</div>;

  function openDetails(cert: CertificateListItem) {
    setSelected(cert);
    setDetailsOpen(true);
  }

  async function copy(text: string, successMsg: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
    } catch {
      toast.error("Copy failed");
    }
  }

  const shareUrl = selected ? `http://localhost:3000/verify/${selected.id}` : "";
  const verifyPath = (id: string) => `/verify/${id}`;

  return (
    <div className="w-full">
      {/* Profile header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-purple-50">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(2,6,23,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 ring-4 ring-indigo-100">
              <AvatarFallback className="bg-indigo-600 text-2xl font-semibold text-white">
                {initials(studentName)}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 space-y-1">
              <div className="text-2xl font-bold text-slate-900">{studentName}</div>
              <div className="text-sm text-slate-600">{studentEmail}</div>
            </div>

            <div className="mt-3">
              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-100" variant="secondary">
                Student
              </Badge>
            </div>

            <div className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="bg-white text-slate-900 ring-1 ring-slate-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">Total Credentials</div>
                  <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-white text-slate-900 ring-1 ring-slate-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">Verified count</div>
                  <div className="mt-1 text-2xl font-semibold">{stats.verifiedCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white text-slate-900 ring-1 ring-slate-200">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">Institutions</div>
                  <div className="mt-1 text-2xl font-semibold">{stats.institutions}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by certificate title or issuer..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="revoked">Revoked</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="outline" onClick={load} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full border bg-slate-50 px-2 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Verified: {certs.filter((c) => !c.revoked).length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-slate-50 px-2 py-1">
              <XCircle className="h-3.5 w-3.5 text-rose-600" />
              Revoked: {certs.filter((c) => c.revoked).length}
            </span>
            <span className="text-slate-400">•</span>
            <span>Tip: Use QR to verify on mobile instantly</span>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-2 w-full animate-pulse bg-gradient-to-r from-indigo-600 to-purple-600" />
                  <CardHeader className="space-y-3">
                    <div className="mx-auto h-14 w-14 animate-pulse rounded-xl bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                    <div className="h-9 w-full animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-5 rounded-2xl border bg-muted/40 p-5 animate-float">
                <Award className="size-10 text-indigo-600" />
              </div>
              <div className="text-lg font-semibold">No credentials yet</div>
              <div className="mt-1 max-w-md text-sm text-muted-foreground">
                Your verified certificates from institutions will appear here.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 tc-fadein-stagger">
              {filtered.map((c) => {
                const issuer = c.issuedBy.orgName ?? c.issuedBy.name;
                const isRevoked = !!c.revoked;
                const statusLabel = isRevoked ? "Revoked" : "Verified ✓";
                const statusClass = isRevoked
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-emerald-600 text-white";

                return (
                  <Card key={c.id} className="relative overflow-hidden border-slate-200 shadow-sm">
                    <div className={`h-1.5 w-full ${isRevoked ? "bg-rose-500" : "bg-gradient-to-r from-indigo-600 to-purple-600"}`} />

                    <div className="absolute right-3 top-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                        <FileText className="size-7" />
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="line-clamp-2 text-base font-semibold">{c.title}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="size-3.5" />
                          <span className="truncate">Issued by: {issuer}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Issued {formatDate(c.issuedAt)}</div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Fingerprint className="mt-0.5 size-3.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-slate-400">
                            {c.fileHash.slice(0, 20)}
                            {c.fileHash.length > 20 ? "…" : ""}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">Verification hash</div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-wrap gap-2 pt-0">
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-600/90 text-white"
                        onClick={() => openDetails(c)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(c.fileUrl, "_blank", "noreferrer")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copy(verifyPath(c.id), "Copied!")}>
                        <Copy className="mr-2 h-4 w-4" />
                        Verify link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setQrCertId(c.id);
                          setQrOpen(true);
                        }}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        QR
                      </Button>
                      {!isRevoked ? (
                        <Button asChild size="sm" variant="outline">
                          <a href={`/api/certificates/${encodeURIComponent(c.id)}/proof`} download>
                            <Download className="mr-2 h-4 w-4" />
                            Proof PDF
                          </a>
                        </Button>
                      ) : null}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Details dialog */}
      <Dialog
        open={detailsOpen}
        onOpenChange={(o) => {
          setDetailsOpen(o);
          if (!o) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="pr-6">{selected.title}</DialogTitle>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      selected.revoked ? "bg-destructive text-destructive-foreground" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {selected.revoked ? "Revoked" : "Verified ✓"}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">ISSUER INFO</div>
                  <div className="rounded-xl border p-3">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <Building2 className="size-4 text-muted-foreground" />
                      <span>{selected.issuedBy.orgName ?? selected.issuedBy.name}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary">Verified Institution</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">CERTIFICATE INFO</div>
                  <div className="rounded-xl border p-3">
                    <div className="text-sm">
                      <div className="font-medium">Title</div>
                      <div className="text-muted-foreground">{selected.title}</div>
                    </div>
                    {selected.description ? (
                      <div className="mt-3 text-sm">
                        <div className="font-medium">Description</div>
                        <div className="text-muted-foreground">{selected.description}</div>
                      </div>
                    ) : null}
                    <div className="mt-3 text-sm">
                      <div className="font-medium">Issue Date</div>
                      <div className="text-muted-foreground">{formatDate(selected.issuedAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">BLOCKCHAIN VERIFICATION</div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Document Fingerprint (SHA-256)</div>
                    <div className="rounded border bg-slate-50 p-3 font-mono text-xs text-slate-700 break-all">
                      {selected.fileHash}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copy(selected.fileHash, "Hash copied")}
                      >
                        <Copy className="mr-2 size-4" />
                        Copy hash
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Transaction ID</div>
                    <div className="rounded border bg-slate-50 p-3 font-mono text-xs text-slate-700 break-all">
                      {selected.blockchainTxId ?? `0x${selected.fileHash}`}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copy(selected.blockchainTxId ?? `0x${selected.fileHash}`, "Transaction ID copied")}
                      >
                        <Copy className="mr-2 size-4" />
                        Copy tx id
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Verification Status</div>
                    <div className="flex items-center gap-2 rounded-xl border p-3">
                      {selected.revoked ? (
                        <>
                          <XCircle className="size-6 text-destructive" />
                          <div className="text-sm font-medium">Revoked / invalid</div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="size-6 text-emerald-600" />
                          <div className="text-sm font-medium">Verified on-chain (simulated)</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">SHARE</div>
                  <div className="text-sm text-muted-foreground">Share verification link with employers:</div>
                  <div className="flex gap-2">
                    <Input readOnly value={shareUrl} />
                    <Button onClick={() => copy(shareUrl, "Link copied")} variant="outline">
                      <Copy className="mr-2 size-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-600/90 text-white">
                  <a href={selected.fileUrl} target="_blank" rel="noreferrer">
                    <Download className="mr-2 size-4" />
                    Download original
                  </a>
                </Button>
                {!selected.revoked ? (
                  <Button asChild variant="outline">
                    <a href={`/api/certificates/${encodeURIComponent(selected.id)}/proof`} download>
                      <CheckCircle className="mr-2 size-4 text-emerald-600" />
                      Download proof (PDF)
                    </a>
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => {
                    setQrCertId(selected.id);
                    setQrOpen(true);
                  }}
                >
                  <QrCode className="mr-2 size-4" />
                  Show QR
                </Button>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <CertificateQrDialog
        certificateId={qrCertId}
        open={qrOpen}
        onOpenChange={(o) => {
          setQrOpen(o);
          if (!o) setQrCertId("");
        }}
      />
    </div>
  );
}

