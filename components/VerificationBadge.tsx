import { Badge } from "@/components/ui/badge";

export function VerificationBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge className="bg-emerald-600 hover:bg-emerald-600">Verified</Badge>
  ) : (
    <Badge variant="destructive">Mismatch</Badge>
  );
}

