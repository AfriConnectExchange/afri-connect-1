'use server';
/**
 * @fileOverview A test flow to verify database connectivity and schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { createClient } from '@/lib/supabase/server';

const TestDbConnectionOutputSchema = z.object({
  profiles: z.array(z.any()),
});

export async function testDbConnection(): Promise<z.infer<typeof TestDbConnectionOutputSchema>> {
  return testDbConnectionFlow();
}

const testDbConnectionFlow = ai.defineFlow(
  {
    name: 'testDbConnectionFlow',
    inputSchema: z.void(),
    outputSchema: TestDbConnectionOutputSchema,
  },
  async () => {
    console.log('Attempting to connect to Supabase and fetch profiles...');
    const supabase = createClient();
    const { data: profiles, error } = await supabase.from('profiles').select('*').limit(5);

    if (error) {
      console.error('Error fetching from Supabase:', error);
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    console.log('Successfully fetched profiles:', profiles);

    return { profiles: profiles || [] };
  }
);
