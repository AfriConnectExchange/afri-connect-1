import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const advert = await request.json();
  const html = `
    <div style="border: 1px solid #ccc; padding: 16px; border-radius: 8px;">
      <h2>${advert.title}</h2>
      <p>${advert.content}</p>
      ${advert.isPremium ? '<p><strong>Premium Listing</strong></p>' : ''}
    </div>
  `;
  return NextResponse.json({ html });
}
