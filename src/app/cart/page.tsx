'use client';
import { useState, useEffect } from 'react';
import { CartPageComponent } from '@/components/cart/cart-page';
import type { CartItem } from '@/components/cart/cart-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import type { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  // This state will eventually be replaced by a global state manager
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // In a real app, this would be fetched from a global state store.
    // For now, we simulate adding some items to the cart for demonstration.
    const mockCart: CartItem[] = [];
    setCartItems(mockCart);
  }, []);

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
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
