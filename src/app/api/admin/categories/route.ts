
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    const snap = await firestore.collection('categories').orderBy('name').get();
    const categories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

// POST a new category
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const firestore = getAdminFirestore();
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, description, parentId } = parsed.data;

    const newCategory = {
      name,
      description: description || '',
      parentId: parentId || null,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: admin.uid,
    };

    const newDocRef = await firestore.collection('categories').add(newCategory);

    return NextResponse.json({ success: true, id: newDocRef.id, ...newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
