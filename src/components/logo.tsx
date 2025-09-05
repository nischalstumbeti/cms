import Link from "next/link";
import { Award } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Award className="h-7 w-7 text-primary" />
      <span className="font-headline text-xl font-bold tracking-tight">
        ContestZen
      </span>
    </Link>
  );
}
