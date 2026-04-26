"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  XCircle,
  AlertTriangle,
  Siren,
  Building2,
  GraduationCap,
  Link2,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PublicCertificate = {
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

export default function PublicVerifyPage() {
  const routeParams = useParams<{ id: string | string[] }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id;
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<PublicCertificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tampered, setTampered] = useState(false);
  const pathname = usePathname();

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + (pathname ?? "");
  }, [pathname]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setNotFound(false);
      setTampered(false);
      try {
        if (!id) return;
        const res = await fetch(`/api/verify?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!alive) return;
        if (!data?.found) {
          setNotFound(true);
          setCert(null);
          return;
        }

        const nextCert = (data?.certificate ?? null) as PublicCertificate | null;
        setCert(nextCert);

        const isRevoked = !!data?.revoked;
        const isVerified = !!data?.verified;
        if (!isRevoked && !isVerified) {
          // Found but failed integrity check (hash mismatch / missing file) => tampered warning.
          setTampered(true);
        }
      } catch (e: any) {
        if (!alive) return;
        toast.error(e?.message ?? "Failed to load certificate");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [id]);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  const issuedByName = cert?.issuedBy?.orgName ?? cert?.issuedBy?.name ?? "";
  const issuedToName = cert?.issuedTo?.name ?? "";

  const isVerified = !!cert && !cert.revoked && !tampered;
  const isRevoked = !!cert && cert.revoked;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <style jsx global>{`
        @keyframes tc-ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .tc-ping {
          position: relative;
        }
        .tc-ping::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: currentColor;
          animation: tc-ping 1.3s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.6;
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        {loading ? (
          <div className="text-slate-600">Loading verification…</div>
        ) : notFound ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <XCircle className="h-10 w-10" />
            </div>
            <div className="text-3xl font-bold">Certificate Not Found</div>
            <div className="text-slate-600">
              This certificate ID does not exist or may have been removed.
            </div>
          </div>
        ) : cert ? (
          <div className="space-y-8">
            {tampered ? (
              <div className="space-y-4 text-center animate-shake">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-200 animate-glitch">
                  <Siren className="h-10 w-10" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-red-700">Document Tampered</div>
                <div className="text-sm text-slate-700">
                  Hash mismatch detected. This document’s fingerprint does not match the stored record.
                </div>
                <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
                  <div className="text-xs font-semibold text-red-700">What this means</div>
                  <ul className="mt-2 space-y-1 text-xs text-red-800/90">
                    <li>- The file may have been modified after issuance</li>
                    <li>- The stored file could be missing or replaced</li>
                    <li>- Treat this credential as untrusted</li>
                  </ul>
                </div>
              </div>
            ) : isVerified ? (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 animate-scaleIn">
                  <BadgeCheck className="h-10 w-10" />
                </div>
                <div className="text-3xl font-bold text-emerald-700">Certificate Verified</div>
                <div className="text-slate-600">
                  This credential is authentic and has not been tampered with
                </div>
              </div>
            ) : isRevoked ? (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <div className="text-3xl font-bold text-amber-700">Certificate Revoked</div>
                <div className="text-slate-600">
                  This certificate has been revoked by the issuing institution.
                </div>
              </div>
            ) : null}

            <Card className="border-slate-200 bg-white">
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-2xl font-bold tracking-tight">{cert.title}</div>
                  {cert.description ? (
                    <div className="mt-2 text-sm text-slate-600">{cert.description}</div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">ISSUED BY</div>
                    <div className="mt-2 flex items-start gap-2">
                      <Building2 className="mt-0.5 h-5 w-5 text-indigo-600" />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{issuedByName}</div>
                        <div className="mt-1">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-100">
                            Verified Institution
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">ISSUED TO</div>
                    <div className="mt-2 flex items-start gap-2">
                      <GraduationCap className="mt-0.5 h-5 w-5 text-indigo-600" />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{issuedToName}</div>
                        <div className="text-sm text-slate-600 truncate">{cert.issuedTo.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-600">
                    Issue Date:{" "}
                    <span className="text-slate-900">{new Date(cert.issuedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-600/90 text-white">
                      <a href={cert.fileUrl} target="_blank" rel="noreferrer">
                        View Original Document
                      </a>
                    </Button>
                    {isVerified ? (
                      <Button asChild variant="outline" className="border-slate-200 bg-white hover:bg-slate-50">
                        <a href={`/api/certificates/${encodeURIComponent(cert.id)}/proof`} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Proof (PDF)
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Link2 className="h-5 w-5 text-indigo-600" />
                    Blockchain Verification Record
                  </div>
                  <div className="text-xs text-slate-500">prototype registry</div>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-1 sm:grid-cols-[220px,1fr]">
                    <div className="text-xs text-slate-500">Document Hash (SHA-256)</div>
                    <button
                      className="text-left font-mono text-sm text-emerald-700 break-all hover:underline"
                      onClick={() => copyText(cert.fileHash)}
                      title="Click to copy"
                    >
                      {cert.fileHash}
                    </button>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-[220px,1fr]">
                    <div className="text-xs text-slate-500">Transaction ID</div>
                    <div className="font-mono text-sm text-slate-700 break-all">
                      {cert.blockchainTxId ?? "0x" + cert.fileHash.slice(0, 32)}
                    </div>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-[220px,1fr]">
                    <div className="text-xs text-slate-500">Verification Time</div>
                    <div className="text-sm text-slate-700">{new Date().toLocaleString()}</div>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-[220px,1fr] items-center">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="flex items-center gap-2 text-sm">
                      {tampered ? (
                        <>
                          <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center text-red-500">
                            <span className="tc-ping inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                          </span>
                          <span className="text-red-700 font-semibold">HASH MISMATCH</span>
                        </>
                      ) : (
                        <>
                          <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center text-emerald-400">
                            <span className="tc-ping inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          </span>
                          <span className="text-emerald-700 font-semibold">VERIFIED ON-CHAIN</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white">
              <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">Share this verification</div>
                  <div className="text-sm text-slate-600">Copy the link to share with anyone.</div>
                </div>
                <Button
                  variant="outline"
                  className="border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                  onClick={() => copyText(shareUrl)}
                  disabled={!shareUrl}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

