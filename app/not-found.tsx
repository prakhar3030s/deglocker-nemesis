import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-white to-slate-50 text-slate-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200">
          <Image src="/logo.svg" alt="TrustChain" width={44} height={44} className="text-indigo-400" />
        </div>
        <div className="mt-6 text-3xl font-bold tracking-tight">Page Not Found</div>
        <div className="mt-2 text-sm text-slate-600">
          The page you’re looking for doesn’t exist or may have been moved.
        </div>
        <div className="mt-6">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-600/90 text-white">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

