
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContest } from "@/context/ContestContext";
import { Badge } from "@/components/ui/badge";

export function ParticipantTable() {
  const { participants } = useContest();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>A list of all registered participants in the contest.</CardDescription>
      </CardHeader>
      <CardContent>
        {participants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {participants.map((p) => (
              <Card key={p.id} className="text-center">
                <CardContent className="flex flex-col items-center p-6 space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={p.profilePhotoUrl} alt={p.name} />
                    <AvatarFallback className="text-3xl">{p.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-sm">
                     <p className="font-bold text-base text-foreground">{p.name}</p>
                     <p className="text-muted-foreground">{p.email}</p>
                     <p className="text-foreground">{p.profession}</p>
                     <Badge variant="secondary" className="capitalize">{p.gender.replace(/-/g, ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center text-muted-foreground py-12">
                No participants yet.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
