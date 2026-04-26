import Link from "next/link";
import Image from "next/image";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import { QuickVerify } from "@/components/QuickVerify";
import { DemoBanner } from "@/components/DemoBanner";
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  BadgeCheck,
  FileText,
  Building2,
  Briefcase,
  GraduationCap,
  Database,
  Link2,
  Map,
  ScanLine,
  Lock,
  Globe,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white text-slate-900 pb-20">
      {/* Hero (BhoomiChain-inspired) */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-200/35 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[520px] w-[520px] rounded-full bg-purple-200/25 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                Issuer + Student + Employer portals
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-9 w-9 text-indigo-600" />
                <div className="text-2xl font-semibold tracking-tight">
                  <span className="text-slate-900">Trust</span>
                  <span className="text-indigo-600">Chain</span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  TrustChain — Verified Academic Credentials
                </h1>
                <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                  A secure digital infrastructure for tamper‑proof academic credentials and instant verification.
                  Built for institutions, students, and recruiters.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white sm:w-auto">
                  <Link href="/login">
                    Explore Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-200 bg-white hover:bg-slate-50 sm:w-auto"
                >
                  <Link href="#quick-verify">Verify Certificate</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 text-sm text-slate-700">
                {[
                  { icon: Lock, label: "Blockchain Security" },
                  { icon: Database, label: "Credential Registry" },
                  { icon: Link2, label: "Public Verification" },
                  { icon: FileText, label: "PDF Proof Download" },
                  { icon: ScanLine, label: "QR Verification" },
                ].map((x) => (
                  <div
                    key={x.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                  >
                    <x.icon className="h-3.5 w-3.5 text-indigo-600" />
                    {x.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="inline-flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    Hero
                  </div>
                  <div className="text-[11px] text-slate-500">TrustChain</div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src="/hero.png.jpeg"
                      alt="TrustChain hero"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 hidden h-20 w-20 rounded-3xl bg-indigo-100/70 blur-xl lg:block" />
            </div>
          </div>
        </div>
      </section>

      <section id="quick-verify" className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <QuickVerify />
      </section>

      {/* Impact / problem stats (BhoomiChain-style) */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <div className="text-xs font-semibold text-indigo-700">Why this matters</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">The credential fraud crisis</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Fake certificates and unverifiable claims slow hiring, increase fraud risk, and force employers to
              spend time chasing paperwork. TrustChain replaces manual verification with cryptographic fingerprints.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { value: "70%+", label: "Background checks delayed by manual verification" },
                { value: "₹ Crores", label: "Lost annually due to credential fraud (industry estimate)" },
                { value: "Days", label: "Time saved with instant public verification" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="mt-2 text-sm text-slate-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">Built for trust</div>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div>Institution-issued records</div>
              </div>
              <div className="flex items-start gap-2">
                <ScanLine className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div>QR-based instant verification</div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div>Downloadable proof (PDF)</div>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div>Tamper detection (hash mismatch)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-xs font-semibold text-indigo-700">The TrustChain solution</div>
              <h3 className="mt-2 text-2xl font-bold tracking-tight">
                A single, tamper‑proof credential registry with public verification
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Every certificate is hashed and stored with an issuer identity. Employers verify authenticity in one
                click by opening a public link or scanning a QR code.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, title: "Immutable fingerprint", desc: "SHA‑256 hash stored as proof." },
                  { icon: Briefcase, title: "Employer verification", desc: "Search and verify instantly." },
                  { icon: GraduationCap, title: "Student wallet", desc: "View and share credentials." },
                  { icon: Link2, title: "Public verify page", desc: "Works from QR + share links." },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <f.icon className="h-4 w-4 text-indigo-600" />
                      {f.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/workflow.png.jpeg"
                  alt="TrustChain workflow"
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-semibold text-indigo-700">How TrustChain works</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">A verification pipeline you can explain in 1 minute</h2>
          <p className="mt-3 text-slate-600">
            Mirrors real credential issuance — with cryptographic guarantees and shareable public verification.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { step: "1", title: "Issue", icon: Building2, desc: "Institution issues a certificate." },
            { step: "2", title: "Hash", icon: FileText, desc: "SHA‑256 fingerprint is generated." },
            { step: "3", title: "Record", icon: Database, desc: "Record stored in registry (tx id for demo)." },
            { step: "4", title: "Verify", icon: ScanLine, desc: "Employer verifies by link/QR instantly." },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                  {s.step}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 text-base font-semibold">{s.title}</div>
              <div className="mt-1 text-sm text-slate-600">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
          <p className="mt-3 text-slate-600">Choose your portal.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <RoleCard
            title="Issuer"
            subtitle="University / College / Academy"
            description="Upload and digitally sign certificates for students (prototype signing via hash + issuer identity)."
            href="/login"
          />
          <RoleCard
            title="Student"
            subtitle="Credential holder"
            description="View received credentials and share them with employers for instant verification."
            href="/login"
          />
          <RoleCard
            title="Employer"
            subtitle="Verifier"
            description="Search candidate credentials and verify authenticity by recomputing the file fingerprint."
            href="/login"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50 via-white to-white p-8 shadow-sm">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(79,70,229,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="relative inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs text-indigo-700">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Demo-ready
              </div>
              <div className="relative mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Try the full TrustChain demo flow in minutes
              </div>
              <div className="relative mt-2 max-w-2xl text-sm text-slate-600">
                Issue certificates as an institution, view them as a student, and verify instantly as an employer —
                with public verification links.
              </div>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-600/90">
                <Link href="/login">Open Demo Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
              >
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                <div className="text-lg font-semibold">
                  <span className="text-slate-900">Trust</span>
                  <span className="text-indigo-600">Chain</span>
                </div>
              </div>
              <div className="mt-3 max-w-md text-sm text-slate-600">
                Decentralized‑style credential verification for academic certificates. Prototype demo built with
                hashing + shareable public verify links.
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="font-semibold">Product</div>
              <Link className="text-slate-600 hover:text-slate-900" href="/login">
                Login
              </Link>
              <Link className="text-slate-600 hover:text-slate-900" href="/register">
                Register
              </Link>
              <div className="text-slate-500">Verify links (from issued certificates)</div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="font-semibold">Resources</div>
              <div className="text-slate-500">FAQ</div>
              <div className="text-slate-500">Docs</div>
              <div className="text-slate-500">Contact</div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} TrustChain. Demo build.</div>
            <div className="flex gap-4">
              <div>Terms</div>
              <div>Privacy</div>
            </div>
          </div>
        </div>
      </footer>

      <DemoBanner />
    </div>
  );
}
