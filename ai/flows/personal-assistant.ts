'use server';

/**
 * @fileOverview A voice-activated personal assistant AI agent for AssistiveVisions.
 *
 * - personalAssistant - A function that handles the personal assistant process.
 * - PersonalAssistantInput - The input type for the personalAssistant function.
 * - PersonalAssistantOutput - The return type for the personalAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
const logger = {
  info: console.log,
  error: console.error,
};
const PersonalAssistantInputSchema = z.object({
  speech: z.string().min(1, 'Speech cannot be empty').describe('The transcribed speech from the user.'),
  location: z.string().optional().describe('The current location of the user (e.g., "Latitude: 40.71, Longitude: -74.00" or "New York City").'),
});
export type PersonalAssistantInput = z.infer<typeof PersonalAssistantInputSchema>;

const PersonalAssistantOutputSchema = z.object({
  response: z.string().min(1, 'Response cannot be empty').describe('The helpful and empathetic response from the personal assistant.'),
});
export type PersonalAssistantOutput = z.infer<typeof PersonalAssistantOutputSchema>;

export async function personalAssistant(input: PersonalAssistantInput): Promise<PersonalAssistantOutput> {
  try {
    PersonalAssistantInputSchema.parse(input);
    logger.info(`Processing personal assistant request: ${input.speech}`);
    const result = await personalAssistantFlow(input);
    logger.info(`Personal assistant response: ${result.response.slice(0, 50)}...`);
    return result;
  } catch (error) {
    logger.error(`Error in personalAssistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      response: "I'm sorry, Vision Buddy didn't understand that. Could you please try again?",
    };
  }
}

const personalAssistantPrompt = ai.definePrompt({
  name: 'personalAssistantPrompt',
  input: { schema: PersonalAssistantInputSchema },
  output: { schema: PersonalAssistantOutputSchema },
  prompt: `You are "Vision Buddy", a friendly and helpful voice assistant for the AssistiveVisions app, designed to help users who may have visual impairments.
Listen carefully to the user's speech. Respond clearly, concisely, and empathetically.
If their location is provided and relevant to their query, use it to give a more helpful answer.

User's speech: {{{speech}}}
{{#if location}}
User's current location: {{{location}}}
{{/if}}

Your response:`,
});

const personalAssistantFlow = ai.defineFlow(
  {
    name: 'personalAssistantFlow',
    inputSchema: PersonalAssistantInputSchema,
    outputSchema: PersonalAssistantOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await personalAssistantPrompt(input);
      if (!output) {
        throw new Error('No output returned from personalAssistantPrompt');
      }
      return output;
    } catch (error) {
      logger.error(`Error in personalAssistantFlow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        response: "I'm sorry, Vision Buddy didn't understand that. Could you please try again?",
      };
    }
  }
);