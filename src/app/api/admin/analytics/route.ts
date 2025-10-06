
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    // For the initial scaffold, return simple counts.
    const usersSnap = await firestore.collection('profiles').get();
    const productsSnap = await firestore.collection('products').get();
    const salesSnap = await firestore.collection('orders').get(); // Assuming sales are in 'orders'

    return NextResponse.json({
      totalUsers: usersSnap.size,
      totalProducts: productsSnap.size,
      totalSales: salesSnap.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
