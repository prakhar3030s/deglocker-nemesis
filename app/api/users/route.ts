import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "").trim();
  const orgName = body.orgName != null ? String(body.orgName).trim() : "";

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "password is required" }, { status: 400 });
  if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });

  if (!["ISSUER", "STUDENT", "EMPLOYER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (role === "ISSUER" && !orgName) {
    return NextResponse.json({ error: "orgName is required for ISSUER" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: role as any,
      orgName: role === "ISSUER" ? orgName : null,
    },
    select: {
      id: true,
      role: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") ?? "").toLowerCase().trim();

  if (email) {
    const student = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, role: true },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    return NextResponse.json({ found: true, student: { id: student.id, name: student.name } });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      orgName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

