import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateFakeTxId, generateHash } from "@/lib/hash";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ISSUER") {
    return NextResponse.json({ error: "Only issuers can upload certificates" }, { status: 403 });
  }

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = form.get("description") ? String(form.get("description")).trim() : null;
  const studentEmail = String(form.get("studentEmail") ?? "").toLowerCase().trim();
  const file = form.get("file");

  if (!title || !studentEmail || !(file instanceof File)) {
    return NextResponse.json(
      { error: "title, studentEmail and file are required" },
      { status: 400 }
    );
  }

  const issuedTo = await prisma.user.findUnique({
    where: { email: studentEmail },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!issuedTo || issuedTo.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileHash = generateHash(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const certificate = await prisma.certificate.create({
    data: {
      title,
      description,
      fileUrl: "/uploads/pending",
      fileHash,
      issuedById: session.user.id,
      issuedToId: issuedTo.id,
      blockchainTxId: generateFakeTxId(),
      verified: true,
    },
    include: {
      issuedBy: { select: { id: true, name: true, email: true, orgName: true, role: true } },
      issuedTo: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  const originalName = String(file.name || "certificate").replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName = `${certificate.id}-${originalName}`;
  const diskPath = path.join(uploadsDir, safeName);
  await fs.writeFile(diskPath, bytes);

  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { fileUrl: `/uploads/${safeName}` },
    include: {
      issuedBy: { select: { id: true, name: true, email: true, orgName: true, role: true } },
      issuedTo: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json({ certificate: updated }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "ISSUER") {
    const certificates = await prisma.certificate.findMany({
      where: { issuedById: session.user.id },
      orderBy: { issuedAt: "desc" },
      include: {
        issuedTo: { select: { id: true, name: true, email: true, orgName: true } },
      },
    });
    return NextResponse.json({ certificates });
  }

  if (session.user.role === "STUDENT") {
    const certificates = await prisma.certificate.findMany({
      where: { issuedToId: session.user.id },
      orderBy: { issuedAt: "desc" },
      include: {
        issuedBy: { select: { id: true, name: true, orgName: true } },
      },
    });
    return NextResponse.json({ certificates });
  }

  // EMPLOYER: nothing here (employers verify via /api/verify)
  return NextResponse.json({ certificates: [] });
}

