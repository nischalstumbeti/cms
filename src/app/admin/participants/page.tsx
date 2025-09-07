"use client";

import { ParticipantTable } from "@/components/dashboard/participant-table";
import { Button } from "@/components/ui/button";
import { useContest, Participant } from "@/context/ContestContext";
import { Download } from "lucide-react";

export default function ParticipantsPage() {
  const { participants } = useContest();

  const exportToCSV = () => {
    if (participants.length === 0) return;

    // Define specific headers for better CSV structure
    const headers = [
      'ID',
      'Name', 
      'Email',
      'Profession',
      'Other Profession',
      'Gender',
      'Registration Date',
      'Last Updated'
    ];

    const rows = participants.map(p => [
      p.id,
      p.name,
      p.email,
      p.profession,
      p.otherProfession || '',
      p.gender,
      p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
      p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `participants-${new Date().toISOString().split('T')[0]}.csv`);
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
