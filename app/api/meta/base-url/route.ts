import { NextResponse } from "next/server";
import os from "os";

function pickLanIp(): string | null {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const addrs = nets[name] ?? [];
    for (const addr of addrs) {
      if (!addr) continue;
      if (addr.family !== "IPv4") continue;
      if (addr.internal) continue;
      // Prefer RFC1918 private LAN ranges
      if (
        addr.address.startsWith("192.168.") ||
        addr.address.startsWith("10.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(addr.address)
      ) {
        return addr.address;
      }
    }
  }

  // Fallback: any non-internal IPv4
  for (const name of Object.keys(nets)) {
    const addrs = nets[name] ?? [];
    for (const addr of addrs) {
      if (!addr) continue;
      if (addr.family !== "IPv4") continue;
      if (addr.internal) continue;
      return addr.address;
    }
  }

  return null;
}

export const runtime = "nodejs";

export async function GET() {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envBase) return NextResponse.json({ baseUrl: envBase });

  const ip = pickLanIp();
  if (!ip) return NextResponse.json({ baseUrl: null });

  return NextResponse.json({ baseUrl: `http://${ip}:3000` });
}

