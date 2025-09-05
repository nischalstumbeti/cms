
"use client";

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContest } from "@/context/ContestContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';

export function SubmissionsTable() {
  const { submissions, participants } = useContest();

  const getParticipant = (id: string) => participants.find(p => p.id === id);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Submission</TableHead>
            <TableHead>Adherence</TableHead>
            <TableHead className="min-w-[300px]">Rationale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length > 0 ? (
            submissions.map((s) => {
              const participant = getParticipant(s.participantId);
              const score = s.adherenceScore !== undefined ? Math.round(s.adherenceScore * 100) : null;

              return (
                <TableRow key={s.id}>
                   <TableCell className="font-medium">{participant?.name || 'Unknown'}</TableCell>
                   <TableCell>
                     {s.fileDataUri.startsWith('data:image') ? (
                        <Image
                            src={s.fileDataUri}
                            alt={s.fileName}
                            width={100}
                            height={100}
                            className="rounded-md object-cover aspect-square"
                        />
                     ) : (
                        <a href={s.fileDataUri} download={s.fileName} className="text-primary hover:underline">
                            {s.fileName}
                        </a>
                     )}
                   </TableCell>
                   <TableCell>
                    {score !== null ? (
                        <div className="w-24">
                            <Progress value={score} />
                            <span className="text-xs text-muted-foreground">{score}%</span>
                        </div>
                    ): (
                        <Badge variant="secondary">Pending</Badge>
                    )}
                   </TableCell>
                   <TableCell className="text-xs text-muted-foreground">
                    {s.rationale || 'AI analysis not complete.'}
                   </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No submissions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
