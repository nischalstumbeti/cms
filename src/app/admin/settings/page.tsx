"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useContest } from "@/context/ContestContext";

export default function SettingsPage() {
  const { registrationOpen, setRegistrationOpen } = useContest();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Contest Settings</CardTitle>
          <CardDescription>Manage general settings for the contest.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="registration-switch" className="text-base font-medium">
                Participant Registration
              </Label>
              <p className="text-sm text-muted-foreground">
                Control whether new participants can register for the contest.
              </p>
            </div>
            <Switch
              id="registration-switch"
              checked={registrationOpen}
              onCheckedChange={setRegistrationOpen}
              aria-label="Toggle participant registration"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
