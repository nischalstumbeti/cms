// src/ai/flows/automated-prompt-generation.ts
'use server';

/**
 * @fileOverview Flow to automatically generate a creative contest prompt or theme.
 *
 * - generateContestPrompt - A function to generate a contest prompt.
 * - GenerateContestPromptInput - The input type for the generateContestPrompt function.
 * - GenerateContestPromptOutput - The return type for the generateContestPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContestPromptInputSchema = z.object({
  contestType: z.string().describe('The type of contest (e.g., photo, video, writing).'),
  themePreferences: z
    .string()
    .describe(
      'Preferences for the theme, any specific keywords or subject areas to include.'
    ),
  difficultyLevel: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the prompt (easy, medium, or hard).'),
});
export type GenerateContestPromptInput = z.infer<
  typeof GenerateContestPromptInputSchema
>;

const GenerateContestPromptOutputSchema = z.object({
  prompt: z.string().describe('The generated contest prompt or theme.'),
  explanation: z
    .string()
    .describe('Explanation of the generated prompt and why it is creative'),
});
export type GenerateContestPromptOutput = z.infer<
  typeof GenerateContestPromptOutputSchema
>;

export async function generateContestPrompt(
  input: GenerateContestPromptInput
): Promise<GenerateContestPromptOutput> {
  return generateContestPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContestPromptPrompt',
  input: {schema: GenerateContestPromptInputSchema},
  output: {schema: GenerateContestPromptOutputSchema},
  prompt: `You are a creative prompt generator for contests. Your goal is to generate engaging, creative and original prompts based on user input.

Contest Type: {{{contestType}}}
Theme Preferences: {{{themePreferences}}}
Difficulty Level: {{{difficultyLevel}}}

Generate a prompt that is appropriate for the specified contest type, incorporates the theme preferences, and aligns with the given difficulty level.

Return both the prompt and an explanation of why it's creative and aligns with the specifications.
`,
});

const generateContestPromptFlow = ai.defineFlow(
  {
    name: 'generateContestPromptFlow',
    inputSchema: GenerateContestPromptInputSchema,
    outputSchema: GenerateContestPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
