import Link from "next/link"
import Image from "next/image"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Emblem_of_Andhra_Pradesh.png/500px-Emblem_of_Andhra_Pradesh.png"
        alt="Govt Logo"
        width={70}
        height={65}
        className="rounded-full"
        data-ai-hint="emblem logo"
      />
      <span className="font-headline text-xl font-bold tracking-tight">
        World Tourism Day 2025 <br />
        <span>Nellore District, AP</span>
      </span>
    </Link>
  )
}
