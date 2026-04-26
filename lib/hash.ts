import crypto from "crypto";

export function generateHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function generateFakeTxId(): string {
  return `0x${crypto.randomBytes(32).toString("hex")}`;
}

