'use client';
import { useState, useEffect } from 'react';
import { CartPageComponent } from '@/components/cart/cart-page';
import type { CartItem } from '@/components/cart/cart-page';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // In a real app, this would be fetched from a global state store.
    // For now, we simulate receiving items from the previous page via search params.
    try {
        const cartData = searchParams.get('cart');
        if (cartData) {
            const items = JSON.parse(cartData);
            setCartItems(items);
        }
    } catch (e) {
        console.error("Failed to parse cart items from URL", e);
        setCartItems([]);
    }
  }, [searchParams]);

  const onNavigate = (page: string) => {
    if (page === 'checkout') {
         router.push(`/checkout?cart=${encodeURIComponent(JSON.stringify(cartItems))}`);
    } else {
        router.push(`/${page}`);
    }
  };

  const handleUpdateCart = (items: CartItem[]) => {
    setCartItems(items);
    toast({
        title: 'Cart Updated',
        description: 'Your shopping cart has been updated.',
    })
  };
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} />
      <CartPageComponent
        cartItems={cartItems}
        onNavigate={onNavigate}
        onUpdateCart={handleUpdateCart}
      />
    </>
  );
}
