import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

const SALT_ROUNDS = 12;
const DEMO_PASSWORD = "demo1234";

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function ensureDemoPdf() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const pdfPath = path.join(uploadsDir, "demo-certificate.pdf");
  if (fs.existsSync(pdfPath)) return;

  // Minimal valid PDF (one blank page). Enough for browsers to render/download.
  const pdfBytes = Buffer.from(
    [
      "%PDF-1.4\n",
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n",
      "4 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n",
      "xref\n0 5\n0000000000 65535 f \n",
      "0000000009 00000 n \n",
      "0000000058 00000 n \n",
      "0000000115 00000 n \n",
      "0000000200 00000 n \n",
      "trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n270\n%%EOF\n",
    ].join(""),
    "utf8"
  );

  fs.writeFileSync(pdfPath, pdfBytes);
}

async function upsertDemoUser(args: {
  email: string;
  name: string;
  role: "ISSUER" | "STUDENT" | "EMPLOYER";
  orgName?: string | null;
  passwordHash: string;
}) {
  const email = normalizeEmail(args.email);
  return prisma.user.upsert({
    where: { email },
    update: {
      name: args.name,
      password: args.passwordHash,
      role: args.role,
      orgName: args.orgName ?? null,
    },
    create: {
      email,
      name: args.name,
      password: args.passwordHash,
      role: args.role,
      orgName: args.orgName ?? null,
    },
  });
}

async function ensureCertificate(args: {
  title: string;
  description: string;
  issuedById: string;
  issuedToId: string;
  verified: boolean;
  revoked: boolean;
}) {
  const existing = await prisma.certificate.findFirst({
    where: {
      title: args.title,
      issuedById: args.issuedById,
      issuedToId: args.issuedToId,
    },
    select: { id: true },
  });
  if (existing) return existing;

  const fileHash = crypto.randomBytes(32).toString("hex");
  const blockchainTxId = "0x" + crypto.randomBytes(32).toString("hex");

  return prisma.certificate.create({
    data: {
      title: args.title,
      description: args.description,
      fileUrl: "/uploads/demo-certificate.pdf",
      fileHash,
      blockchainTxId,
      issuedById: args.issuedById,
      issuedToId: args.issuedToId,
      verified: args.verified,
      revoked: args.revoked,
    },
    select: { id: true },
  });
}

async function main() {
  ensureDemoPdf();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const nitIssuer = await upsertDemoUser({
    email: "nit@trustchain.demo",
    passwordHash,
    name: "Dr. Rajesh Kumar",
    role: "ISSUER",
    orgName: "NIT Raipur",
  });

  const iimIssuer = await upsertDemoUser({
    email: "iim@trustchain.demo",
    passwordHash,
    name: "Prof. Anita Sharma",
    role: "ISSUER",
    orgName: "IIM Bangalore",
  });

  const arjun = await upsertDemoUser({
    email: "arjun@trustchain.demo",
    passwordHash,
    name: "Arjun Mehta",
    role: "STUDENT",
    orgName: null,
  });

  const priya = await upsertDemoUser({
    email: "priya@trustchain.demo",
    passwordHash,
    name: "Priya Singh",
    role: "STUDENT",
    orgName: null,
  });

  await upsertDemoUser({
    email: "hr@trustchain.demo",
    passwordHash,
    name: "Neha Joshi",
    role: "EMPLOYER",
    orgName: "Google India",
  });

  await upsertDemoUser({
    email: "tech@trustchain.demo",
    passwordHash,
    name: "Vikram Nair",
    role: "EMPLOYER",
    orgName: "TCS Recruitment",
  });

  await ensureCertificate({
    title: "B.Tech Computer Science - Final Year Certificate",
    description: "Bachelor of Technology in Computer Science and Engineering, 2024 batch, CGPA 8.7",
    issuedById: nitIssuer.id,
    issuedToId: arjun.id,
    verified: true,
    revoked: false,
  });

  await ensureCertificate({
    title: "Data Structures & Algorithms Course Completion",
    description: "Successfully completed advanced DSA course with distinction",
    issuedById: nitIssuer.id,
    issuedToId: arjun.id,
    verified: true,
    revoked: false,
  });

  await ensureCertificate({
    title: "MBA Marketing - Diploma Certificate",
    description: "Master of Business Administration with specialization in Marketing, 2024",
    issuedById: iimIssuer.id,
    issuedToId: priya.id,
    verified: true,
    revoked: false,
  });

  await ensureCertificate({
    title: "Python for Data Science Certificate",
    description: "Course completion - Note: revoked due to academic misconduct",
    issuedById: nitIssuer.id,
    issuedToId: priya.id,
    verified: true,
    revoked: true,
  });

  console.log("✅ Seed complete: demo users + certificates created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

