
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';
import { z } from 'zod';

const categoryUpdateSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters.').optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

// PUT to update a category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();
    const { id } = params;
    const body = await request.json();
    const parsed = categoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const categoryRef = firestore.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updateData = {
        ...parsed.data,
        updatedAt: new Date().toISOString(),
    };

    await categoryRef.update(updateData);

    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

// DELETE a category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();
    const { id } = params;

    const categoryRef = firestore.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const categoryData = categoryDoc.data();
    if (categoryData?.productCount > 0) {
        return NextResponse.json({ error: 'Cannot delete category with associated products.' }, { status: 400 });
    }
    
    // Also need to check if it's a parent to other categories
    const childrenQuery = await firestore.collection('categories').where('parentId', '==', id).limit(1).get();
    if(!childrenQuery.empty) {
        return NextResponse.json({ error: 'Cannot delete category that has sub-categories.' }, { status: 400 });
    }

    await categoryRef.delete();

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
