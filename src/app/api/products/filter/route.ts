import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const filters = await request.json();
  console.log('Filtering products with criteria:', filters);
  return NextResponse.json([
    { id: 'PROD-1', name: 'Kente Cloth', price: 125, category: 'textiles', rating: 4.8 },
  ]);
}
