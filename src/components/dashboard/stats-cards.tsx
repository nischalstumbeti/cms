"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Upload, CheckCircle } from "lucide-react";
import { useContest } from "@/context/ContestContext";

export function StatsCards() {
  const { participants, submissions } = useContest();
  const registrationStatus = useContest().registrationOpen;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{participants.length}</div>
          <p className="text-xs text-muted-foreground">Registered for the contest</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          <Upload className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{submissions.length}</div>
          <p className="text-xs text-muted-foreground">Entries received</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${registrationStatus ? 'text-accent' : 'text-destructive'}`}>
            {registrationStatus ? 'Open' : 'Closed'}
          </div>
          <p className="text-xs text-muted-foreground">Current status for new sign-ups</p>
        </CardContent>
      </Card>
    </div>
  );
}
