
"use client";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useContest } from "@/context/ContestContext";
import { Skeleton } from "@/components/ui/skeleton";

export function NoticeBoard() {
  const { announcement } = useContest();

  return (
    <Card className="glass-card">
      <CardHeader className="relative">
         <div className="animate-pulse absolute top-4 right-4 h-3 w-3 rounded-full bg-destructive" />
        <CardTitle className="flex items-center gap-3 font-headline text-2xl font-bold text-primary">
          <Megaphone className="h-8 w-8" />
          <span>Contest Announcement</span>
        </CardTitle>
        <CardDescription>
            Official notification from the District Administration.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4 p-6 text-base">
        {announcement ? (
          <>
            <p className="font-bold text-lg text-foreground">
              {announcement.title}
            </p>
            <p className="text-muted-foreground">
              {announcement.description}
            </p>
            <div className="pt-4">
                <p className="font-semibold">Theme:</p>
                <p className="text-lg font-bold text-primary">"{announcement.theme}"</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
