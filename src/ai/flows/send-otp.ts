'use server';
/**
 * @fileOverview A flow to generate and send a One-Time Password (OTP) for email verification.
 *
 * - sendOtp - A function that handles OTP generation and email sending.
 * - SendOtpInput - The input type for the sendOtp function.
 * - SendOtpOutput - The return type for the sendOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendOtpEmail } from '@/lib/email';

export const SendOtpInputSchema = z.object({
  email: z.string().email().describe('The email address to send the OTP to.'),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

export const SendOtpOutputSchema = z.object({
  otp: z.string().length(6).describe('The 6-digit OTP that was sent.'),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async ({ email }) => {
    const otp = generateOtp();
    
    try {
      await sendOtpEmail(email, otp);
      return { otp };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // In a real app, you might want to handle this more gracefully
      throw new Error('Failed to send OTP. Please try again later.');
    }
  }
);
