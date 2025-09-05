import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NoticeBoard() {
  return (
    <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-5"></div>
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 font-headline text-3xl font-bold">
          <Megaphone className="h-8 w-8 text-primary" />
          Contest Announcement
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4 text-lg">
        <div className="animate-pulse absolute top-0 right-2 h-3 w-3 rounded-full bg-destructive" />
        <p className="font-semibold text-primary">
          World Tourism Day 2025 Photography Contest
        </p>
        <p className="text-muted-foreground">
          The District Administration is pleased to announce a photography contest to celebrate World Tourism Day 2025. Capture the beauty of our district's tourist destinations and win exciting prizes.
        </p>
        <p className="font-bold pt-4">Theme: "Tourism & Green Investments"</p>
      </CardContent>
    </Card>
  );
}
