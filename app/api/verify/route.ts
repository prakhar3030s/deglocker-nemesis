import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { generateHash } from "@/lib/hash";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hash = (searchParams.get("hash") ?? "").trim();
  const id = (searchParams.get("id") ?? "").trim();

  if (!hash && !id) {
    return NextResponse.json({ found: false, verified: false, revoked: false, certificate: null });
  }

  const certificate = await prisma.certificate.findFirst({
    where: hash ? { fileHash: hash } : { id },
    include: {
      issuedBy: { select: { id: true, name: true, orgName: true } },
      issuedTo: { select: { id: true, name: true, email: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json({ found: false, verified: false, revoked: false, certificate: null });
  }

  const rel = certificate.fileUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", rel);
  const fileBytes = await fs.readFile(filePath).catch(() => null);

  const matchesHash = fileBytes ? generateHash(fileBytes) === certificate.fileHash : false;
  const verified = matchesHash && certificate.verified && !certificate.revoked;

  return NextResponse.json({
    found: true,
    verified,
    revoked: certificate.revoked,
    certificate: {
      ...certificate,
    },
  });
}

