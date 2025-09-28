'use client';

import { useState } from 'react';
import { ProductPageComponent } from '@/components/product/product-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import type { CartItem } from '@/components/cart/cart-page';
import type { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const handleNavigate = (page: string, newProductId?: string) => {
    if (page === 'product' && newProductId) {
      router.push(`/product/${newProductId}`);
    } else {
      router.push(`/${page}`);
    }
  };

  const onAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
    });
  };
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount}/>
      <ProductPageComponent 
        productId={productId} 
        onNavigate={handleNavigate} 
        onAddToCart={onAddToCart} 
      />
    </>
  );
}
