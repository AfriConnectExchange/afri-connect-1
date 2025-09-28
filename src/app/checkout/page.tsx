'use client';

import { useState, useEffect } from 'react';
import { CheckoutPageComponent } from '@/components/checkout/checkout-page';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/components/cart/cart-page';
import { Header } from '@/components/dashboard/header';

export default function CheckoutPage() {
  const router = useRouter();

  // In a real app, this would come from a global state (Context, Redux, etc.)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch the cart from a global state or API
    // If the cart is empty, redirect back to the cart page
    // For now, we simulate an empty cart which will trigger a redirect in the checkout component.
    const itemsFromState: CartItem[] = []; // Replace with actual state management
    if (itemsFromState.length === 0) {
      // router.push('/cart');
    }
    setCartItems(itemsFromState);
  }, [router]);


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
