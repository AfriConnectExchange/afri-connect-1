import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { generateCategories } from '@/ai/flows/generate-categories-flow';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const result = await generateCategories();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate categories' }, { status: 500 });
  }
}
