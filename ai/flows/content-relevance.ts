'use server';

/**
 * @fileOverview A tool to determine the relevance of web content for presentation to the user.
 *
 * - isContentRelevant - A function that checks if web content is relevant.
 * - ContentRelevanceInput - The input type for the isContentRelevant function.
 * - ContentRelevanceOutput - The return type for the isContentRelevant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
// Simple logger implementation (replace with your preferred logger if needed)
const logger = {
  info: console.log,
  error: console.error,
};

const ContentRelevanceInputSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').describe('The user query or topic of interest.'),
  content: z.string().min(1, 'Content cannot be empty').describe('The web content to evaluate for relevance.'),
});
export type ContentRelevanceInput = z.infer<typeof ContentRelevanceInputSchema>;

const ContentRelevanceOutputSchema = z.object({
  isRelevant: z.boolean().describe('Whether the content is relevant to the query.'),
  reason: z.string().describe('The reason for the relevance determination.'),
});
export type ContentRelevanceOutput = z.infer<typeof ContentRelevanceOutputSchema>;

export async function isContentRelevant(input: ContentRelevanceInput): Promise<ContentRelevanceOutput> {
  try {
    ContentRelevanceInputSchema.parse(input);
    logger.info(`Processing content relevance for query: ${input.query}`);
    const result = await contentRelevanceFlow(input);
    logger.info(`Content relevance result: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    logger.error(`Error in isContentRelevant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      isRelevant: false,
      reason: 'Failed to evaluate content relevance due to an internal error.',
    };
  }
}

const contentRelevancePrompt = ai.definePrompt({
  name: 'contentRelevancePrompt',
  input: { schema: ContentRelevanceInputSchema },
  output: { schema: ContentRelevanceOutputSchema },
  prompt: `You are an AI assistant that determines whether a given piece of web content is relevant to a user's query or topic of interest.

  Query: {{{query}}}
  Content: {{{content}}}

  Determine if the content is relevant to the query. Explain your reasoning.
  Return a JSON object with 'isRelevant' (boolean) and 'reason' (string) fields.
  `,
});

const contentRelevanceFlow = ai.defineFlow(
  {
    name: 'contentRelevanceFlow',
    inputSchema: ContentRelevanceInputSchema,
    outputSchema: ContentRelevanceOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await contentRelevancePrompt(input);
      if (!output) {
        throw new Error('No output returned from contentRelevancePrompt');
      }
      return output;
    } catch (error) {
      logger.error(`Error in contentRelevanceFlow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isRelevant: false,
        reason: 'Failed to process content relevance due to an internal error.',
      };
    }
  }
);