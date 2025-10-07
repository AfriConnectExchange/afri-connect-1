'use server';
/**
 * @fileOverview An AI flow for generating product categories.
 *
 * - generateCategories - A function that suggests categories for a given topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CategorySuggestion = z.object({
  name: z.string().describe('The name of the main category.'),
  subcategories: z.array(z.object({
    name: z.string().describe('The name of the sub-category.'),
  })).describe('A list of relevant sub-categories.'),
});

const GenerateCategoriesInputSchema = z.undefined();
const GenerateCategoriesOutputSchema = z.object({
  categories: z.array(CategorySuggestion),
});

export type GenerateCategoriesOutput = z.infer<typeof GenerateCategoriesOutputSchema>;

export async function generateCategories(): Promise<GenerateCategoriesOutput> {
  return generateCategoriesFlow();
}

const prompt = ai.definePrompt({
  name: 'generateCategoriesPrompt',
  input: { schema: GenerateCategoriesInputSchema },
  output: { schema: GenerateCategoriesOutputSchema },
  prompt: `You are an expert e-commerce architect. Your task is to generate a structured list of common product categories and sub-categories for a general online marketplace.

  Please generate 5-7 relevant main categories. For each main category, provide 5-10 relevant sub-categories.
  Ensure the names are clear, concise, and suitable for a large, diverse marketplace.
  Respond only with the structured JSON output.`,
});

const generateCategoriesFlow = ai.defineFlow(
  {
    name: 'generateCategoriesFlow',
    inputSchema: GenerateCategoriesInputSchema,
    outputSchema: GenerateCategoriesOutputSchema,
  },
  async () => {
    const { output } = await prompt(undefined);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);
