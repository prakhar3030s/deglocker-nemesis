import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RoleCard({
  title,
  subtitle,
  description,
  href,
}: {
  title: string;
  subtitle: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="flex flex-col border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-auto bg-indigo-600 hover:bg-indigo-600/90 text-white">
          <Link href={href}>Open portal</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

