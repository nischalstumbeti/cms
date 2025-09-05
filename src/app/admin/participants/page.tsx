"use client";

import { ParticipantTable } from "@/components/dashboard/participant-table";
import { Button } from "@/components/ui/button";
import { useContest, Participant } from "@/context/ContestContext";
import { Download } from "lucide-react";

export default function ParticipantsPage() {
  const { participants } = useContest();

  const exportToCSV = () => {
    if (participants.length === 0) return;

    const headers = Object.keys(participants[0]).join(',');
    const rows = participants.map(p => 
      Object.values(p).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participants.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Participants</h1>
        <Button onClick={exportToCSV} disabled={participants.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>
      <ParticipantTable />
    </div>
  );
}
