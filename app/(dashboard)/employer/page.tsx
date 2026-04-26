"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Search,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  FileBadge,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export default function EmployerPage() {
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [hashOrId, setHashOrId] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const [student, setStudent] = useState<{ name: string; email: string } | null>(null);
  const [certs, setCerts] = useState<
    Array<{
      id: string;
      title: string;
      issuedAt: string;
      fileHash: string;
      revoked: boolean;
      verified: boolean;
      blockchainTxId: string | null;
      issuedBy: { id: string; name: string; email: string; orgName: string | null };
    }>
  >([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hasSearched, setHasSearched] = useState(false);

  const trust = useMemo(() => {
    if (!hasSearched) return null;
    if (certs.length === 0) return { kind: "none" as const };
    if (certs.some((c) => c.revoked)) return { kind: "revoked" as const };
    if (certs.every((c) => c.verified) && certs.length > 0) return { kind: "trusted" as const };
    return { kind: "trusted" as const };
  }, [certs, hasSearched]);

  async function runEmailSearch(nextEmail?: string) {
    const e = (nextEmail ?? email).toLowerCase().trim();
    if (!e) return toast.error("Enter a student email");
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/employer/search?email=${encodeURIComponent(e)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Search failed");
      setStudent(data.student ?? null);
      setCerts(data.certificates ?? []);
      setRecent((prev) => [e, ...prev.filter((x) => x !== e)].slice(0, 3));
    } catch (err: any) {
      setStudent(null);
      setCerts([]);
      toast.error(err?.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function runHashLookup() {
    const v = hashOrId.trim();
    if (!v) return toast.error("Enter a verification hash or certificate ID");
    setLoading(true);
    setHasSearched(true);
    try {
      const looksLikeHash = v.length >= 32 && /^[0-9a-fA-F]+$/.test(v);
      const url = looksLikeHash
        ? `/api/verify?hash=${encodeURIComponent(v)}`
        : `/api/verify?id=${encodeURIComponent(v)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Not found");
      const c = data?.certificate;
      if (!c) throw new Error("Not found");
      setStudent({ name: c.issuedTo?.name ?? "Student", email: c.issuedTo?.email ?? "" });
      setCerts([
        {
          id: c.id,
          title: c.title ?? "Certificate",
          issuedAt: c.issuedAt,
          fileHash: c.fileHash,
          revoked: !!c.revoked,
          verified: !!c.verified,
          blockchainTxId: c.blockchainTxId ?? null,
          issuedBy: c.issuedBy,
        },
      ]);
    } catch (err: any) {
      setStudent(null);
      setCerts([]);
      toast.error(err?.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  if (!data?.user) return <div className="mx-auto max-w-4xl px-4 py-12">Please sign in.</div>;
  if (data.user.role !== "EMPLOYER")
    return <div className="mx-auto max-w-4xl px-4 py-12">Only EMPLOYER accounts can access this page.</div>;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verify Candidate Credentials</h1>
            <p className="text-slate-600">
              Instantly verify the authenticity of any candidate&apos;s academic credentials
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Briefcase className="h-7 w-7" />
          </div>
        </div>

        <Card className="border-slate-200 bg-white">
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="text-sm text-slate-700">Search by Student Email</div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@email.com"
                    className="h-14 pl-12 text-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                    type="email"
                  />
                </div>
                <Button
                  onClick={() => runEmailSearch()}
                  disabled={loading}
                  className="h-14 px-8 bg-indigo-600 hover:bg-indigo-600/90 text-white"
                >
                  {loading ? "Verifying..." : "Verify Credentials"}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <div className="text-xs text-slate-500">OR</div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={hashOrId}
                onChange={(e) => setHashOrId(e.target.value)}
                placeholder="Enter Verification Hash or Certificate ID"
                className="h-14 text-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
              <Button
                onClick={runHashLookup}
                disabled={loading}
                variant="outline"
                className="h-14 px-8 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              >
                Verify by Hash
              </Button>
            </div>

            {recent.length ? (
              <div className="pt-2">
                <div className="text-xs text-slate-500 mb-2">Recent searches</div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((e) => (
                    <button
                      key={e}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setEmail(e);
                        runEmailSearch(e);
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {!hasSearched ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 animate-float">
              <Search className="h-6 w-6" />
            </div>
            <div className="font-semibold text-slate-900">Search for a candidate above to verify their credentials</div>
            <div className="mt-1 text-sm text-slate-500">
              Enter an email, certificate ID, or document hash to begin.
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Card className="border-slate-200 bg-white">
              <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    {(student?.name ?? student?.email ?? "S")
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">{student?.name ?? "Candidate"}</div>
                    <div className="truncate text-sm text-slate-600">{student?.email ?? ""}</div>
                    <div className="mt-1 text-sm text-slate-500">{certs.length} credentials found</div>
                  </div>
                </div>

                <div>
                  {trust?.kind === "trusted" ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      Trusted Candidate
                    </div>
                  ) : trust?.kind === "revoked" ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Has Revoked Credentials
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                      <ShieldOff className="h-4 w-4" />
                      No Credentials Found
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {certs.map((c) => {
                const issuer = c.issuedBy?.orgName ?? c.issuedBy?.name ?? "Institution";
                const issueDate = new Date(c.issuedAt).toLocaleDateString();
                const isRevoked = !!c.revoked;
                const isExpanded = !!expanded[c.id];
                const fingerprint = (c.fileHash ?? "").slice(0, 16);

                return (
                  <div
                    key={c.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className={`absolute left-0 top-0 h-full w-1.5 ${isRevoked ? "bg-red-500" : "bg-emerald-500"}`} />
                    <div className="p-5 pl-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <FileBadge className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{c.title}</div>
                          <div className="mt-1 text-sm text-slate-600 truncate">
                            {issuer} • Issued {issueDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:items-end">
                        <div
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                            isRevoked
                              ? "border-red-500/30 bg-red-500/10 text-red-300"
                              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {isRevoked ? "Revoked" : "Verified"}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xs text-slate-600">{fingerprint}</div>
                          <a
                            href={`/verify/${c.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline"
                          >
                            View Certificate <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                            onClick={() => setExpanded((p) => ({ ...p, [c.id]: !p[c.id] }))}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-2">
                        <div className="text-xs text-slate-500">Full Hash</div>
                        <div className="font-mono text-xs text-slate-700 break-all">{c.fileHash}</div>
                        <div className="text-xs text-slate-500 pt-2">Transaction ID</div>
                        <div className="font-mono text-xs text-slate-700 break-all">
                          {c.blockchainTxId ?? "0x" + (c.fileHash ?? "").slice(0, 32)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {!loading && certs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                  No credentials found for this candidate.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

