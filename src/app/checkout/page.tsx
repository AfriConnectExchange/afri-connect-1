'use client';

import { useState, useEffect } from 'react';
import { CheckoutPageComponent } from '@/components/checkout/checkout-page';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CartItem } from '@/components/cart/cart-page';
import { Header } from '@/components/dashboard/header';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    try {
        const cartData = searchParams.get('cart');
        if (cartData) {
            const items: CartItem[] = JSON.parse(cartData);
            setCartItems(items);
            if (items.length === 0) {
                 router.push('/cart');
            }
        } else {
             router.push('/cart');
        }
    } catch (e) {
        console.error("Failed to parse cart items from URL", e);
        setCartItems([]);
        router.push('/cart');
    }
  }, [router, searchParams]);


  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleUpdateCart = (items: CartItem[]) => {
    setCartItems(items);
  };
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
    <Header cartCount={cartCount}/>
    <CheckoutPageComponent
      cartItems={cartItems}
      onNavigate={onNavigate}
      onUpdateCart={handleUpdateCart}
    />
    </>
  );
}
