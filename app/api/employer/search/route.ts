import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Only EMPLOYER accounts can access this endpoint" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") ?? "").toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const student = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const certificates = await prisma.certificate.findMany({
    where: { issuedToId: student.id },
    orderBy: { issuedAt: "desc" },
    include: {
      issuedBy: { select: { id: true, name: true, email: true, orgName: true, role: true } },
      issuedTo: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json({
    student: { name: student.name, email: student.email },
    certificates,
  });
}

