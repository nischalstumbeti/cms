import { Megaphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NoticeBoard() {
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
        <p className="font-bold text-lg text-foreground">
          World Tourism Day 2025 Photography Contest
        </p>
        <p className="text-muted-foreground">
          The District Administration is pleased to announce a photography contest to celebrate World Tourism Day 2025. Capture the beauty of our district's tourist destinations and win exciting prizes.
        </p>
        <div className="pt-4">
            <p className="font-semibold">Theme:</p>
            <p className="text-lg font-bold text-primary">"Tourism & Green Investments"</p>
        </div>
      </CardContent>
    </Card>
  );
}
