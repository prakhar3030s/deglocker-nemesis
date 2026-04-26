import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationBadge } from "@/components/VerificationBadge";
import { HashDisplay } from "@/components/HashDisplay";

export type CertificateListItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileHash: string;
  issuedAt: string;
  verified: boolean;
  blockchainTxId: string | null;
  issuedBy: { id: string; name: string; email: string; orgName: string | null };
  issuedTo: { id: string; name: string; email: string };
};

export function CertificateCard({
  cert,
  actions,
}: {
  cert: CertificateListItem;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="truncate">{cert.title}</CardTitle>
          <div className="mt-1 text-xs text-muted-foreground">
            Issued by {cert.issuedBy.orgName ?? cert.issuedBy.name} • to {cert.issuedTo.name} •{" "}
            {new Date(cert.issuedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VerificationBadge verified={cert.verified} />
          {actions}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {cert.description ? <p className="text-sm text-muted-foreground">{cert.description}</p> : null}
        <HashDisplay hash={cert.fileHash} />
        {cert.blockchainTxId ? (
          <div className="text-xs text-muted-foreground">
            Blockchain Tx (simulated): <span className="font-mono">{cert.blockchainTxId}</span>
          </div>
        ) : null}
        <a className="text-sm underline" href={cert.fileUrl} target="_blank" rel="noreferrer">
          View uploaded file
        </a>
      </CardContent>
    </Card>
  );
}

