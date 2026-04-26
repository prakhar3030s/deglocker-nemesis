"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CheckCircle,
  CloudUpload,
  Copy,
  ExternalLink,
  QrCode,
  Loader2,
  Sparkles,
  Fingerprint,
  Radio,
  DatabaseZap,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateQrDialog } from "@/components/CertificateQrDialog";

type IssuerCertificate = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileHash: string;
  issuedAt: string;
  verified: boolean;
  revoked: boolean;
  blockchainTxId: string | null;
  issuedTo: { id: string; name: string; email: string; orgName: string | null };
};

export default function IssuerPage() {
  const { data } = useSession();
  const issuerName = data?.user?.name ?? "Issuer";
  const orgName = data?.user?.orgName ?? "Institution";

  const [tab, setTab] = useState<"issue" | "issued">("issue");
  const [certs, setCerts] = useState<IssuerCertificate[]>([]);
  const [loading, setLoading] = useState(false);

  const [studentEmail, setStudentEmail] = useState("");
  const [studentPreview, setStudentPreview] = useState<{ id: string; name: string } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successCert, setSuccessCert] = useState<IssuerCertificate | null>(null);

  const [search, setSearch] = useState("");
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<IssuerCertificate | null>(null);
  const [revoking, setRevoking] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);
  const [qrCertId, setQrCertId] = useState<string>("");

  const [issueFxOpen, setIssueFxOpen] = useState(false);
  const [issueFxStep, setIssueFxStep] = useState<
    "ipfs" | "sha" | "tx" | "chain" | "success" | "error"
  >("ipfs");
  const [issueFxError, setIssueFxError] = useState<string>("");

  async function loadIssued() {
    setLoading(true);
    try {
      const res = await fetch("/api/certificates");
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
    if (data?.user?.role === "ISSUER") loadIssued();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.role]);

  const stats = useMemo(() => {
    const total = certs.length;
    const revoked = certs.filter((c) => c.revoked).length;
    const active = total - revoked;
    return { total, active, revoked };
  }, [certs]);

  const filteredCerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certs;
    return certs.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.issuedTo.name.toLowerCase().includes(q) ||
        c.issuedTo.email.toLowerCase().includes(q)
    );
  }, [certs, search]);

  async function lookupStudent() {
    const email = studentEmail.toLowerCase().trim();
    setStudentPreview(null);
    if (!email) return;

    setLookupLoading(true);
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("Student not found");
      setStudentPreview(data.student);
    } catch {
      setStudentPreview(null);
    } finally {
      setLookupLoading(false);
    }
  }

  function onPickFile(f: File | null) {
    if (!f) return;
    const okType = ["application/pdf", "image/jpeg", "image/png"].includes(f.type);
    if (!okType) {
      toast.error("Only PDF, JPG, JPEG, PNG allowed.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Max file size is 10MB.");
      return;
    }
    setFile(f);
  }

  async function issueCertificate() {
    const email = studentEmail.toLowerCase().trim();
    if (!email) return toast.error("Student email is required.");
    if (!studentPreview) return toast.error("Please select a valid student email.");
    if (!title.trim()) return toast.error("Certificate title is required.");
    if (!file) return toast.error("Please upload a PDF or image.");

    setIssuing(true);
    setIssueFxError("");
    setIssueFxStep("ipfs");
    setIssueFxOpen(true);
    try {
      const form = new FormData();
      form.set("studentEmail", email);
      form.set("title", title.trim());
      form.set("description", description.trim());
      form.set("file", file);

      // Futuristic staged UI (best-effort, does not affect real issuance)
      const t1 = setTimeout(() => setIssueFxStep("sha"), 650);
      const t2 = setTimeout(() => setIssueFxStep("tx"), 1450);
      const t3 = setTimeout(() => setIssueFxStep("chain"), 2200);

      const res = await fetch("/api/certificates", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Issue failed");

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIssueFxStep("success");

      toast.success("Certificate issued successfully!");
      setSuccessCert(data.certificate);
      setSuccessOpen(true);
      setTab("issued");
      setTitle("");
      setDescription("");
      setStudentEmail("");
      setStudentPreview(null);
      setFile(null);
      await loadIssued();

      setTimeout(() => setIssueFxOpen(false), 850);
    } catch (e: any) {
      setIssueFxStep("error");
      setIssueFxError(e?.message ?? "Issue failed");
      toast.error(e?.message ?? "Issue failed");
    } finally {
      setIssuing(false);
    }
  }

  async function revokeCertificate() {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/certificates/${revokeTarget.id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Revoke failed");
      toast.success("Certificate revoked.");
      setRevokeOpen(false);
      setRevokeTarget(null);
      await loadIssued();
    } catch (e: any) {
      toast.error(e?.message ?? "Revoke failed");
    } finally {
      setRevoking(false);
    }
  }

  if (!data?.user) return <div className="mx-auto max-w-4xl px-4 py-12">Please sign in.</div>;
  if (data.user.role !== "ISSUER")
    return <div className="mx-auto max-w-4xl px-4 py-12">Only ISSUER accounts can access this page.</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 h-fit space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {(orgName?.[0] ?? issuerName?.[0] ?? "I").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{orgName}</div>
                  <div className="text-xs text-muted-foreground">{issuerName}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Verified Institution
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Total Issued</div>
                  <div className="text-xl font-semibold">{stats.total}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Active</div>
                  <div className="text-xl font-semibold">{stats.active}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Revoked</div>
                  <div className="text-xl font-semibold">{stats.revoked}</div>
                </Card>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Each certificate is hashed and timestamped on issue.
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Issuer Dashboard</h2>
              <p className="text-sm text-muted-foreground">Issue and manage verified credentials.</p>
            </div>
            <Button variant="outline" onClick={loadIssued} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="issue">Issue Certificate</TabsTrigger>
              <TabsTrigger value="issued">Issued Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="issue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Certificate</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="studentEmail">Student Email</Label>
                    <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        id="studentEmail"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        onBlur={lookupStudent}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") lookupStudent();
                        }}
                        className="pl-9"
                        placeholder="student@example.com"
                      />
                    </div>
                    {lookupLoading ? (
                      <div className="text-xs text-muted-foreground">Searching…</div>
                    ) : studentPreview ? (
                      <div className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{studentPreview.name[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{studentPreview.name}</span>
                        <Badge variant="secondary">STUDENT</Badge>
                      </div>
                    ) : studentEmail.trim() ? (
                      <div className="text-xs text-muted-foreground">No student found for that email.</div>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="title">Certificate Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="B.Tech Degree Certificate"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="desc">Description (optional)</Label>
                    <textarea
                      id="desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Major, grade, honors..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>File Upload</Label>
                    <div
                      className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
                        dragOver ? "border-indigo-500 bg-indigo-500/5" : "border-muted-foreground/20"
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        onPickFile(e.dataTransfer.files?.[0] ?? null);
                      }}
                      onClick={() => document.getElementById("fileInput")?.click()}
                      role="button"
                      tabIndex={0}
                    >
                      <CloudUpload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="mt-2 text-sm font-medium">
                        Drag & drop PDF or image, or click to browse
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">PDF, JPG, JPEG, PNG • max 10MB</div>
                      <input
                        id="fileInput"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                      />

                      {file ? (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Selected: <span className="font-medium text-foreground">{file.name}</span> •{" "}
                          {(file.size / 1024 / 1024).toFixed(2)}MB
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-indigo-500 hover:bg-indigo-500/90 text-white"
                    onClick={issueCertificate}
                    disabled={issuing}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {issuing ? "Issuing..." : "Issue Certificate"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issued" className="mt-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    placeholder="Search by student or title..."
                  />
                </div>
              </div>

              <div className="space-y-3 tc-fadein-stagger">
                {filteredCerts.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold">{c.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {c.issuedTo.name} • {c.issuedTo.email}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {new Date(c.issuedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {c.revoked ? (
                            <Badge variant="destructive">Revoked</Badge>
                          ) : (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600">Verified</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setQrCertId(c.id);
                              setQrOpen(true);
                            }}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Show QR
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(c.fileHash);
                              toast.success("Hash copied");
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {c.fileHash.slice(0, 16)}…
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <a href={c.fileUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View file
                            </a>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={c.revoked}
                            onClick={() => {
                              setRevokeTarget(c);
                              setRevokeOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {!loading && filteredCerts.length === 0 ? (
                  <div className="rounded-2xl border bg-muted/20 p-10 text-center">
                    <div className="text-sm text-muted-foreground">
                      No certificates issued yet. Issue your first one above.
                    </div>
                  </div>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate Issued Successfully</DialogTitle>
          </DialogHeader>
          {successCert ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckCircle className="h-6 w-6 text-emerald-600 animate-[scaleIn_200ms_ease-out]" />
                </div>
                <div>
                  <div className="font-semibold">{successCert.title}</div>
                  <div className="text-sm text-muted-foreground">{successCert.issuedTo.name}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Blockchain Fingerprint</div>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <div className="font-mono text-xs break-all">{successCert.fileHash}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(successCert.fileHash);
                      toast.success("Fingerprint copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Transaction ID: </span>
                <span className="font-mono text-xs">{successCert.blockchainTxId ?? "—"}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Timestamp: </span>
                <span>{new Date(successCert.issuedAt).toLocaleString()}</span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke certificate?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Are you sure you want to revoke this certificate? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={revokeCertificate} disabled={revoking}>
              {revoking ? "Revoking..." : "Revoke"}
            </Button>
          </div>
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

      {/* Issuing FX modal */}
      <Dialog
        open={issueFxOpen}
        onOpenChange={(o) => {
          setIssueFxOpen(o);
          if (!o) {
            setIssueFxError("");
            setIssueFxStep("ipfs");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Issuing Certificate
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Securing credential with cryptographic fingerprint + prototype blockchain record.
            </div>
          </DialogHeader>

          <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-4">
            <div className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${issueFxStep === "error" ? "bg-red-500" : "bg-indigo-600"} animate-pulse`} />
              <div className="text-sm font-semibold">
                {issueFxStep === "success"
                  ? "Verification Successful"
                  : issueFxStep === "error"
                    ? "Issuing Failed"
                    : "Processing…"}
              </div>
            </div>
            {issueFxStep === "error" ? (
              <div className="mt-2 text-xs text-red-700">{issueFxError || "Issue failed"}</div>
            ) : (
              <div className="mt-2 text-xs text-slate-600">Do not close this window.</div>
            )}
          </div>

          <div className="space-y-2">
            {[
              {
                key: "ipfs",
                label: "Uploading to IPFS",
                icon: DatabaseZap,
              },
              {
                key: "sha",
                label: "Generating SHA-256",
                icon: Fingerprint,
              },
              {
                key: "tx",
                label: "Creating transaction",
                icon: Radio,
              },
              {
                key: "chain",
                label: "Writing to blockchain",
                icon: ShieldCheck,
              },
              {
                key: "success",
                label: "Verification successful",
                icon: CheckCircle,
              },
            ].map((s, idx) => {
              const order: Record<string, number> = { ipfs: 0, sha: 1, tx: 2, chain: 3, success: 4, error: 99 };
              const current = order[issueFxStep] ?? 0;
              const done = idx < current && issueFxStep !== "error";
              const active = idx === current && issueFxStep !== "success" && issueFxStep !== "error";
              const isSuccess = issueFxStep === "success" && s.key === "success";
              const isError = issueFxStep === "error";

              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className={`flex items-center justify-between rounded-xl border bg-white px-3 py-2 ${
                    active ? "ring-2 ring-indigo-200 animate-fadeInUp" : ""
                  } ${isError ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        done || isSuccess
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : active
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">{s.label}</div>
                  </div>

                  {done || isSuccess ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 animate-scaleIn" />
                  ) : active ? (
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  ) : null}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueFxOpen(false)} disabled={issueFxStep !== "error"}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

