import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, BrainCircuit, Users } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Logo />
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
        <section className="relative py-20 text-center md:py-32 lg:py-40">
          <div
            className="absolute inset-0 -z-10 bg-primary/10"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
            }}
          />
          <div className="container">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              ContestZen
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Unleash Creativity, Seamlessly.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="container space-y-12">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                All-in-One Contest Platform
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                From registration to submission, ContestZen provides the tools you need to run a successful creative contest.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">Easy Registration</h3>
                  <p className="text-muted-foreground">
                    A simple and secure form to collect participant details and profile photos.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <BrainCircuit className="h-8 w-8" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">AI-Powered Prompts</h3>
                  <p className="text-muted-foreground">
                    Generate unique contest themes with AI and automatically assess submissions for adherence.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">Admin Dashboard</h3>
                  <p className="text-muted-foreground">
                    Manage participants, control contest status, and view insightful analytics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ContestZen. All rights reserved.
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
