import Link from 'next/link';
import { ParticipantLoginForm } from '@/components/auth/participant-login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Participant Login</CardTitle>
            <CardDescription>Access the submission portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <ParticipantLoginForm />
            <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
