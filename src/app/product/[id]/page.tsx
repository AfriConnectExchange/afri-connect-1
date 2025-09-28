'use client';

import { useState, useEffect } from 'react';
import { ProductPageComponent } from '@/components/product/product-page';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import type { CartItem } from '@/components/cart/cart-page';
import type { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.id;
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
     try {
        const cartData = searchParams.get('cart');
        if (cartData) {
            setCart(JSON.parse(cartData));
        }
    } catch (e) {
        console.error("Failed to parse cart items from URL", e);
    }
  }, [searchParams]);

  const handleNavigate = (page: string, newProductId?: string) => {
    const cartQuery = cart.length > 0 ? `?cart=${encodeURIComponent(JSON.stringify(cart))}` : '';
    if (page === 'product' && newProductId) {
      router.push(`/product/${newProductId}${cartQuery}`);
    } else {
        if (page === 'cart') {
             router.push(`/cart${cartQuery}`);
        } else {
            router.push(`/${page}`);
        }
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
  };
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartQueryString = cart.length > 0 ? `?cart=${encodeURIComponent(JSON.stringify(cart))}` : '';

  return (
    <>
      <Header cartCount={cartCount} cartQuery={cartQueryString} />
      <ProductPageComponent 
        productId={productId} 
        onNavigate={handleNavigate} 
        onAddToCart={onAddToCart} 
      />
    </>
  );
}
