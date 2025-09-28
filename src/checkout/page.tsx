'use client';

import { useEffect } from 'react';
import { CheckoutPageComponent } from '@/components/checkout/checkout-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useCart } from '@/context/cart-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, subtotal, clearCart } = useCart();

  useEffect(() => {
    if (cart.length === 0) {
       router.push('/cart');
    }
  }, [cart, router]);

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <>
    <Header cartCount={cartCount}/>
    <CheckoutPageComponent
      cartItems={cart}
      subtotal={subtotal}
      onNavigate={onNavigate}
      clearCart={clearCart}
    />
    </>
  );
}
