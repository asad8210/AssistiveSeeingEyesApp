'use server';

/**
 * @fileOverview An AI agent that provides detailed descriptions of visual scenes.
 *
 * - describeDetailedScene - A function that takes an image and returns a detailed textual description.
 * - DescribeDetailedSceneInput - The input type for the describeDetailedScene function.
 * - DescribeDetailedSceneOutput - The return type for the describeDetailedScene function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
const logger = {
  info: console.log,
  error: console.error,
};

const DescribeDetailedSceneInputSchema = z.object({
  photoDataUri: z
    .string()
    .min(1, 'photoDataUri cannot be empty')
    .regex(/^data:image\/[a-zA-Z]+;base64,/, 'photoDataUri must be a valid base64-encoded image data URI')
    .describe("A photo of a scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  previousDetailedDescription: z
    .string()
    .optional()
    .describe('The previous detailed description of the scene, if available.'),
});
export type DescribeDetailedSceneInput = z.infer<typeof DescribeDetailedSceneInputSchema>;

const DescribeDetailedSceneOutputSchema = z.object({
  detailedDescription: z.string().min(1, 'Description cannot be empty').describe('A comprehensive and detailed textual description of the scene.'),
});
export type DescribeDetailedSceneOutput = z.infer<typeof DescribeDetailedSceneOutputSchema>;

export async function describeDetailedScene(input: DescribeDetailedSceneInput): Promise<DescribeDetailedSceneOutput> {
  try {
    DescribeDetailedSceneInputSchema.parse(input);
    logger.info(`Processing scene description for photoDataUri: ${input.photoDataUri.slice(0, 50)}...`);
    const result = await describeDetailedSceneFlow(input);
    logger.info(`Scene description result: ${result.detailedDescription.slice(0, 50)}...`);
    return result;
  } catch (error) {
    logger.error(`Error in describeDetailedScene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      detailedDescription: 'Unable to describe the scene due to an internal error. Please try again.',
    };
  }
}

const prompt = ai.definePrompt({
  name: 'describeDetailedScenePrompt',
  input: { schema: DescribeDetailedSceneInputSchema },
  output: { schema: DescribeDetailedSceneOutputSchema },
  prompt: `You are an expert at describing visual scenes for visually impaired users. Analyze the provided image and describe everything you see in detail.
Mention individual objects, their characteristics (like color, texture, type if discernible), their approximate location in the frame (e.g., "in the foreground", "on the left", "top-right corner"), and any activities or interactions.
Be as comprehensive as possible, paying attention to both large and small elements. If a person is visible, describe their apparent actions or posture if discernible, but avoid guessing emotions or identities.
Prioritize describing elements that would be most relevant or interesting for someone who cannot see the scene.
Make the description sound natural and engaging.

{{#if previousDetailedDescription}}
The previous detailed description for a very similar scene was: "{{previousDetailedDescription}}".
If the current scene is substantially the same, you can acknowledge this briefly and then focus on any new or changed elements, or re-iterate key elements if nothing changed.
If the scene is different, describe it fully.
{{/if}}

Image to describe:
{{media url=photoDataUri}}`,
});

const describeDetailedSceneFlow = ai.defineFlow(
  {
    name: 'describeDetailedSceneFlow',
    inputSchema: DescribeDetailedSceneInputSchema,
    outputSchema: DescribeDetailedSceneOutputSchema,
    // If you need to set safety settings, check the Genkit documentation for the correct place to do so.
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('No output returned from describeDetailedScenePrompt');
      }
      return output;
    } catch (error) {
      logger.error(`Error in describeDetailedSceneFlow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        detailedDescription: 'Unable to describe the scene due to an internal error. Please try again.',
      };
    }
  }
);