'use client';

import { useState, useEffect } from 'react';
import { ProductPageComponent } from '@/components/product/product-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import type { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const { addToCart, cartCount } = useCart();
  const { toast } = useToast();

  const handleNavigate = (page: string, newProductId?: string) => {
    if (page === 'product' && newProductId) {
      router.push(`/product/${newProductId}`);
    } else {
      router.push(`/${page}`);
    }
  };

  const onAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <ProductPageComponent 
        productId={productId} 
        onNavigate={handleNavigate} 
        onAddToCart={onAddToCart} 
      />
    </>
  );
}
