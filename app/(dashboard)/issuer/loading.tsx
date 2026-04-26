export default function LoadingIssuer() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-14 w-full rounded-md bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="h-56 rounded-xl border bg-muted/20 animate-pulse" />
          <div className="h-28 rounded-xl border bg-muted/20 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-56 rounded-md bg-muted/30 animate-pulse" />
          <div className="h-10 w-full rounded-xl border bg-muted/20 animate-pulse" />
          <div className="h-72 w-full rounded-xl border bg-muted/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

