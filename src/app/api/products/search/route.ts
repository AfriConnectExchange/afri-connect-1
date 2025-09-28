import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  console.log(`Searching for products with query: "${query}"`);
  return NextResponse.json([
    { id: 'PROD-1', name: 'Kente Cloth', price: 125, category: 'textiles', rating: 4.8 },
    { id: 'PROD-2', name: 'Shea Butter', price: 15, category: 'beauty', rating: 4.9 },
  ]);
}
