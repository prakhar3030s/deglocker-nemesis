export default function LoadingStudent() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white/20 animate-pulse" />
            <div className="mt-4 space-y-2 w-full max-w-sm">
              <div className="mx-auto h-6 w-48 rounded bg-white/20 animate-pulse" />
              <div className="mx-auto h-4 w-64 rounded bg-white/15 animate-pulse" />
            </div>
            <div className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/15 ring-1 ring-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}

