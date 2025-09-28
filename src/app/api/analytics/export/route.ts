import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { format, data } = await request.json();
  console.log(`Exporting data to: ${format}`);
  const fileContent = format === 'csv' ? 'col1,col2\nval1,val2' : JSON.stringify(data);
  return NextResponse.json({ success: true, fileContent });
}
