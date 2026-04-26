import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function dashboardForRole(role?: string | null) {
  if (role === "ISSUER") return "/issuer";
  if (role === "STUDENT") return "/student";
  if (role === "EMPLOYER") return "/employer";
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({ req });
  if (!token?.role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  const expected = dashboardForRole(String(token.role));
  if (!expected) return NextResponse.next();

  if (!pathname.startsWith(expected)) {
    const url = req.nextUrl.clone();
    url.pathname = expected;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/issuer/:path*", "/student/:path*", "/employer/:path*"],
};

