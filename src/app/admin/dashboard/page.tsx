"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { Analytics } from "@/components/dashboard/analytics";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
      <StatsCards />
      <Analytics />
    </div>
  );
}
