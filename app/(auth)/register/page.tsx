"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "ISSUER" | "STUDENT" | "EMPLOYER";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    if (!password) next.password = "Password is required.";
    if (password && password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    if (password && confirmPassword && password !== confirmPassword)
      next.confirmPassword = "Passwords do not match.";
    if (role === "ISSUER" && !orgName.trim()) next.orgName = "Organization name is required for issuers.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          orgName: role === "ISSUER" ? orgName : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Registration failed");

      const login = await signIn("credentials", { email, password, redirect: false });
      if (!login?.ok) throw new Error("Registered, but auto-login failed. Please sign in.");

      const session = await getSession();
      const r = session?.user?.role;
      if (r === "ISSUER") window.location.href = "/issuer";
      else if (r === "STUDENT") window.location.href = "/student";
      else if (r === "EMPLOYER") window.location.href = "/employer";
      else window.location.href = "/";
    } catch (e: any) {
      toast.error(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            <div className="text-2xl font-semibold tracking-tight">
              <span className="text-slate-900">Trust</span>
              <span className="text-indigo-600">Chain</span>
            </div>
          </div>
        </div>

        <Card className="bg-white border border-slate-200 text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Create account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-700">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="Jane Doe"
              />
              {errors.name ? <p className="text-xs text-red-300">{errors.name}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="you@example.com"
              />
              {errors.email ? <p className="text-xs text-red-300">{errors.email}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
              />
              {errors.password ? <p className="text-xs text-red-300">{errors.password}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-red-300">{errors.confirmPassword}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700">Select Role</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setRole("ISSUER")}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    role === "ISSUER"
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  <div className="mt-2 text-sm font-semibold">ISSUER</div>
                  <div className="text-xs text-slate-500">University / College / Academy</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    role === "STUDENT"
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <GraduationCap className="h-5 w-5 text-indigo-400" />
                  <div className="mt-2 text-sm font-semibold">STUDENT</div>
                  <div className="text-xs text-slate-500">Student seeking jobs</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("EMPLOYER")}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    role === "EMPLOYER"
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                  <div className="mt-2 text-sm font-semibold">EMPLOYER</div>
                  <div className="text-xs text-slate-500">Company / Recruiter</div>
                </button>
              </div>
            </div>

            {role === "ISSUER" ? (
              <div className="grid gap-2">
                <Label htmlFor="orgName" className="text-slate-700">
                  Organization Name
                </Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  placeholder="e.g. Trust University"
                />
                {errors.orgName ? <p className="text-xs text-red-300">{errors.orgName}</p> : null}
              </div>
            ) : null}

            <Button
              onClick={onSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Account
            </Button>
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link className="underline text-indigo-700 hover:text-indigo-800" href="/login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

