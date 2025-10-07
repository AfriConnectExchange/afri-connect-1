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

const GenerateCategoriesInputSchema = z.string();
const GenerateCategoriesOutputSchema = z.object({
  categories: z.array(CategorySuggestion),
});

export type GenerateCategoriesOutput = z.infer<typeof GenerateCategoriesOutputSchema>;

export async function generateCategories(topic: string): Promise<GenerateCategoriesOutput> {
  return generateCategoriesFlow(topic);
}

const prompt = ai.definePrompt({
  name: 'generateCategoriesPrompt',
  input: { schema: GenerateCategoriesInputSchema },
  output: { schema: GenerateCategoriesOutputSchema },
  prompt: `You are an expert e-commerce architect. Your task is to generate a structured list of product categories and sub-categories for a given topic.

  The topic is: {{{_input}}}

  Please generate 3-5 relevant main categories. For each main category, provide 5-10 relevant sub-categories.
  Ensure the names are clear, concise, and suitable for an online marketplace.
  Respond only with the structured JSON output.`,
});

const generateCategoriesFlow = ai.defineFlow(
  {
    name: 'generateCategoriesFlow',
    inputSchema: GenerateCategoriesInputSchema,
    outputSchema: GenerateCategoriesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);
