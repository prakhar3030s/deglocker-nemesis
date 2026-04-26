import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { generateHash } from "@/lib/hash";

export const runtime = "nodejs";

function pdfEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  // A tiny single-page PDF with Helvetica text.
  // We manually assemble objects + xref for maximum portability (no deps).
  const contentLines: string[] = [];
  contentLines.push("BT");
  contentLines.push("/F1 12 Tf");

  // Start near top-left, then step down.
  let y = 760;
  for (const raw of lines) {
    const t = pdfEscape(raw);
    contentLines.push(`1 0 0 1 50 ${y} Tm (${t}) Tj`);
    y -= 18;
    if (y < 80) break;
  }
  contentLines.push("ET");

  const contentStream = contentLines.join("\n") + "\n";

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n"
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}endstream\nendobj\n`
  );
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  const header = "%PDF-1.4\n";
  const parts: string[] = [header];
  const offsets: number[] = [0]; // xref object 0

  let cursor = Buffer.byteLength(header, "utf8");
  for (const obj of objects) {
    offsets.push(cursor);
    parts.push(obj);
    cursor += Buffer.byteLength(obj, "utf8");
  }

  const xrefStart = cursor;
  let xref = "xref\n0 6\n";
  xref += "0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    const off = String(offsets[i]).padStart(10, "0");
    xref += `${off} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  parts.push(xref);
  parts.push(trailer);

  return Buffer.from(parts.join(""), "utf8");
}

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
  if (certificate.revoked) return NextResponse.json({ error: "Certificate revoked" }, { status: 409 });

  // Verify integrity by recomputing hash from stored file.
  const rel = certificate.fileUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", rel);
  const fileBytes = await fs.readFile(filePath).catch(() => null);
  const matchesHash = fileBytes ? generateHash(fileBytes) === certificate.fileHash : false;

  const verified = matchesHash && certificate.verified && !certificate.revoked;
  if (!verified) return NextResponse.json({ error: "Certificate not verified" }, { status: 409 });

  const issuedByName = certificate.issuedBy.orgName ?? certificate.issuedBy.name ?? "Institution";
  const issuedToName = certificate.issuedTo.name ?? "Student";
  const verificationTime = new Date().toLocaleString();

  const pdf = buildSimplePdf([
    "TrustChain — Verification Proof",
    "--------------------------------",
    `Certificate ID: ${certificate.id}`,
    `Title: ${certificate.title}`,
    `Issued By: ${issuedByName}`,
    `Issued To: ${issuedToName} (${certificate.issuedTo.email})`,
    `Issued At: ${new Date(certificate.issuedAt).toLocaleString()}`,
    `Document Hash (SHA-256): ${certificate.fileHash}`,
    `Blockchain Tx ID: ${certificate.blockchainTxId ?? "—"}`,
    `Verification Time: ${verificationTime}`,
    "",
    "Status: VERIFIED (hash matched)",
  ]);

  const filenameSafe = `trustchain-verification-proof-${certificate.id}.pdf`;
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameSafe}"`,
      "Cache-Control": "no-store",
    },
  });
}

