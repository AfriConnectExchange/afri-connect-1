'use client';
import { CartPageComponent } from '@/components/cart/cart-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useCart } from '@/context/cart-context';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, cartCount, subtotal } = useCart();
  
  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleUpdateCart = (items: any[]) => {
    // This is now managed by the context, but we might need more specific functions
    // e.g., if the cart page batch updates, it would call a context function.
    // For now, quantity updates are handled individually.
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <CartPageComponent
        cartItems={cart}
        onNavigate={onNavigate}
        onUpdateCart={handleUpdateCart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        subtotal={subtotal}
      />
    </>
  );
}
