import { genkit, type GenkitConfig } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const genkitConfig: GenkitConfig = {
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  enableTracingAndMetrics: true,
};

export const ai = genkit(genkitConfig);
