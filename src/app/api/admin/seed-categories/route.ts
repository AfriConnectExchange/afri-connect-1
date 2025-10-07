
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';
import { writeBatch } from 'firebase-admin/firestore';

const categoriesToSeed = [
    { 
        name: 'Electronics', 
        subcategories: [
            "Mobile Phones & Accessories",
            "Computers & Laptops",
            "Cameras & Video Equipment",
            "Home Appliances"
        ]
    },
    {
        name: 'Fashion & Apparel',
        subcategories: [
            "Women's Clothing & Shoes",
            "Men's Clothing & Shoes",
            "Bags & Accessories",
            "Jewelry & Watches"
        ]
    },
    {
        name: 'Home & Garden',
        subcategories: [
            "Furniture & Home Decor",
            "Kitchen & Dining",
            "Gardening & Outdoor"
        ]
    },
    {
        name: 'Health & Beauty',
        subcategories: [
            "Skincare & Cosmetics",
            "Haircare & Styling",
            "Vitamins & Supplements"
        ]
    },
    {
        name: 'Baby & Kids',
        subcategories: [
            "Toys & Games",
            "Clothing & Gear"
        ]
    },
    {
        name: 'Art & Crafts',
        subcategories: [
            "Handmade Crafts",
            "Art Supplies"
        ]
    },
    {
        name: 'Services',
        subcategories: [
            "Tutoring & Lessons",
            "Home Repair",
            "Event Services"
        ]
    }
];

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const firestore = await getAdminFirestore();
    const batch = writeBatch(firestore);

    // 1. Clear existing categories (optional, but prevents duplicates on re-run)
    const existingCategoriesSnap = await firestore.collection('categories').get();
    existingCategoriesSnap.forEach(doc => {
      batch.delete(doc.ref);
    });

    let count = 0;

    // 2. Add new categories
    for (const category of categoriesToSeed) {
        const parentCategoryRef = firestore.collection('categories').doc();
        batch.set(parentCategoryRef, {
            name: category.name,
            description: `A wide range of ${category.name.toLowerCase()}.`,
            parentId: null,
            productCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: admin.uid,
        });
        count++;

        for (const sub of category.subcategories) {
            const subCategoryRef = firestore.collection('categories').doc();
            batch.set(subCategoryRef, {
                name: sub,
                parentId: parentCategoryRef.id,
                productCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: admin.uid,
            });
            count++;
        }
    }

    await batch.commit();

    return NextResponse.json({ success: true, count }, { status: 201 });
  } catch (error: any) {
    console.error("Error seeding categories:", error);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
