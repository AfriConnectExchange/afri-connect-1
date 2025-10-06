
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = await getAdminFirestore();

    const usersSnap = await firestore.collection('profiles').count().get();
    const productsSnap = await firestore.collection('products').where('status', '==', 'active').count().get();
    const salesSnap = await firestore.collection('orders').count().get();

    // In a real app, you might calculate revenue by summing up order totals.
    // For now, we are returning counts as a basic KPI.
    // const ordersQuery = await firestore.collection('orders').where('status', '==', 'delivered').get();
    // const totalRevenue = ordersQuery.docs.reduce((sum, doc) => sum + doc.data().total_amount, 0);

    return NextResponse.json({
      totalUsers: usersSnap.data().count,
      totalProducts: productsSnap.data().count,
      totalSales: salesSnap.data().count,
      // In a real app, you would fetch real stats for these as well
      openDisputes: 5, // Placeholder
      platformRevenue: 45231.89, // Placeholder
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
