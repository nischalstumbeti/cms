
"use client";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";

export default function SubmissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Submissions</h1>
      </div>
      <SubmissionsTable />
    </div>
  );
}
