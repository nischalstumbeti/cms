import { AdminSignupForm } from '@/components/auth/admin-signup-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function AdminSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Create Admin Account</CardTitle>
            <CardDescription>This is a one-time setup for the contest administrator.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
