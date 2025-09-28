'use client';

import { useState } from 'react';
import { CheckoutPageComponent } from '@/components/checkout/checkout-page';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/components/cart/cart-page';
import { Header } from '@/components/dashboard/header';

export default function CheckoutPage() {
  const router = useRouter();

  // In a real app, this would come from a global state (Context, Redux, etc.)
  const [cartItems, setCartItems] = useState<CartItem[]>([
     {
      id: 1,
      name: 'Traditional Kente Cloth - Authentic Ghanaian Design',
      price: 125,
      originalPrice: 145,
      seller: 'Accra Crafts',
      quantity: 1,
      inStock: true,
      category: 'Clothing',
      shippingCost: 5.99,
      image:
        'https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 2,
      name: 'Handcrafted Wooden Sculpture - Elephant Design',
      price: 78,
      seller: 'Lagos Artisans',
      quantity: 2,
      inStock: true,
      category: 'Crafts',
      shippingCost: 12.5,
      image:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnRzfGVufDF8fHx8MTc1ODEyMTQ4MHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ]);

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
