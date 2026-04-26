"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="p-6">
        <div className="text-xl font-semibold">Something went wrong</div>
        <div className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred while loading this page.
        </div>
        <div className="mt-5">
          <Button onClick={() => reset()} className="bg-indigo-500 hover:bg-indigo-500/90 text-white">
            Retry
          </Button>
        </div>
      </Card>
    </div>
  );
}

