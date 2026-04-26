"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoBanner } from "@/components/DemoBanner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res?.ok) throw new Error("Invalid credentials");

      const session = await getSession();
      const role = session?.user?.role;
      if (role === "ISSUER") window.location.href = "/issuer";
      else if (role === "STUDENT") window.location.href = "/student";
      else if (role === "EMPLOYER") window.location.href = "/employer";
      else window.location.href = "/";
    } catch (e: any) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4 py-12 pb-20">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            <div className="text-2xl font-semibold tracking-tight">
              <span className="text-slate-900">Trust</span>
              <span className="text-indigo-600">Chain</span>
            </div>
          </div>
          <p className="text-sm text-slate-600">Trust Every Credential. Verify Every Future.</p>
        </div>

        <Card className="bg-white border border-slate-200 text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Sign in</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link className="underline text-indigo-700 hover:text-indigo-800" href="/register">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <DemoBanner />
    </div>
  );
}

