'use client';

import { ProductPageComponent } from '@/components/product/product-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';

// This page now correctly handles the client-side nature of its operations.
export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;

  // The router is now passed down correctly to the client component.
  const handleNavigate = (page: string, newProductId?: string) => {
    if (page === 'product' && newProductId) {
      router.push(`/product/${newProductId}`);
    } else {
      router.push(`/${page}`);
    }
  };

  const onAddToCart = (product: any) => {
    // This logic can be expanded later with global state management.
    console.log('Added to cart:', product);
  };

  return (
    <>
      <Header />
      <ProductPageComponent 
        productId={productId} 
        onNavigate={handleNavigate} 
        onAddToCart={onAddToCart} 
      />
    </>
  );
}

    