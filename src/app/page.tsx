import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Camera, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Image src="https://picsum.photos/40/40" alt="Govt Logo" width={40} height={40} className="rounded-full" data-ai-hint="emblem logo" />
          <div>
            <div className="font-headline text-xl font-bold tracking-tight">
                Official Tourism Day Contest
            </div>
            <p className="text-sm text-muted-foreground">Government of India</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Participant Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full h-[60vh] text-white">
           <Image
            src="https://picsum.photos/1200/800"
            alt="Hero background image of a monument in India"
            fill
            className="object-cover"
            data-ai-hint="india gate"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex flex-col items-center justify-center container text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Incredible India Contest
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg md:text-xl text-primary-foreground/90">
              Celebrate the spirit of India by showcasing its beauty. An initiative by the Government of India.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Participate Now</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="container space-y-12">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Explore the Wonders of India
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                Participate in photography, videography, and writing contests that celebrate India's rich culture, heritage, and landscapes.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">Photography Contests</h3>
                  <p className="text-muted-foreground">
                    Capture stunning landscapes, vibrant festivals, and everyday life.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Globe className="h-8 w-8" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">Cultural Showcases</h3>
                  <p className="text-muted-foreground">
                    Share stories, poems, or videos that bring Indian traditions to life.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">Win Amazing Prizes</h3>
                  <p className="text-muted-foreground">
                    Get recognized for your talent and win exciting prizes and travel vouchers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Government of India. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground">
              Admin Login
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
