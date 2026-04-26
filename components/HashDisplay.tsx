import { Card } from "@/components/ui/card";

export function HashDisplay({ hash }: { hash: string }) {
  return (
    <Card className="px-3 py-2">
      <div className="text-xs text-muted-foreground">SHA-256 Fingerprint</div>
      <div className="mt-1 font-mono text-xs break-all">{hash}</div>
    </Card>
  );
}

