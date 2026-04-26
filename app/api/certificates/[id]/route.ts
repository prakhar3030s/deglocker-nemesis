import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      issuedBy: { select: { id: true, name: true, orgName: true } },
      issuedTo: { select: { id: true, name: true, email: true } },
    },
  });

  if (!certificate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ certificate });
}

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ISSUER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const existing = await prisma.certificate.findUnique({
    where: { id },
    select: { id: true, issuedById: true },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.issuedById !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const certificate = await prisma.certificate.update({
    where: { id },
    data: { revoked: true, verified: false },
  });

  return NextResponse.json({ certificate });
}

