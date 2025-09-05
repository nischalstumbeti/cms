"use client";
import { PromptGenerator } from "@/components/prompt-generator";

export default function PromptPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Prompt Generation</h1>
            <p className="text-muted-foreground">
                Use AI to generate a creative prompt for your contest. Once generated, you can set it as the active prompt for all participant submissions.
            </p>
            <PromptGenerator />
        </div>
    );
}
