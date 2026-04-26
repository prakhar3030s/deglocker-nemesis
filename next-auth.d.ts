import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ISSUER" | "STUDENT" | "EMPLOYER";
      name?: string | null;
      orgName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ISSUER" | "STUDENT" | "EMPLOYER";
    name?: string | null;
    orgName?: string | null;
  }
}

