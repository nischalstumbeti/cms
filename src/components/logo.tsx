import Link from "next/link";
import { Award } from "lucide-react";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Image src="https://picsum.photos/40/40" alt="Govt Logo" width={32} height={32} className="rounded-full" data-ai-hint="emblem logo" />
      <span className="font-headline text-xl font-bold tracking-tight">
        ContestZen
      </span>
    </Link>
  );
}
