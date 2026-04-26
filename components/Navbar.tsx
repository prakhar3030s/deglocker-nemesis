"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data } = useSession();
  const role = data?.user?.role;
  const name = data?.user?.name ?? "User";
  const pathname = usePathname();
  const minimal = pathname?.startsWith("/verify/");

  const roleBadgeClass =
    role === "ISSUER"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : role === "STUDENT"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : role === "EMPLOYER"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "";

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShieldCheck className="h-6 w-6 text-indigo-600" />
          <span>
            <span className="text-slate-900">Trust</span>
            <span className="text-indigo-600">Chain</span>
          </span>
        </Link>

        {minimal ? null : (
          <>
            {/* Desktop */}
            <nav className="hidden items-center gap-2 sm:flex">
              {role ? (
                <>
                  <span className="text-sm text-slate-600">{name}</span>
                  <Badge variant="outline" className={roleBadgeClass}>
                    {role}
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                  >
                    <Link href={`/${role.toLowerCase()}`}>Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-600/90 text-white"
                  >
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </nav>

            {/* Mobile */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {role ? (
                    <>
                      <DropdownMenuItem disabled>{name}</DropdownMenuItem>
                      <DropdownMenuItem disabled>{role}</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${role.toLowerCase()}`}>Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Register</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

