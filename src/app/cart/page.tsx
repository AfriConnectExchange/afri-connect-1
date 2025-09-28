'use client';
import { useState, useEffect } from 'react';
import { CartPageComponent } from '@/components/cart/cart-page';
import type { CartItem } from '@/components/cart/cart-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';

export default function CartPage() {
  const router = useRouter();
  // This state will eventually be replaced by a global state manager
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // In a real app, this would fetch the cart from a global state (e.g., Context API, Redux)
    // or from the user's session/database. For now, it's an empty array.
    setCartItems([]);
  }, []);

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleUpdateCart = (items: CartItem[]) => {
    setCartItems(items);
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
