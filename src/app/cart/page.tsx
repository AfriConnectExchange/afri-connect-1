'use client';
import { useState } from 'react';
import { CartPageComponent } from '@/components/cart/cart-page';
import type { CartItem } from '@/components/cart/cart-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';

export default function CartPage() {
  const router = useRouter();
  // This state will eventually be replaced by a global state manager
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
        'https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
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
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnRzfGVufDF8fHx8MTc1ODEyMTQ4MHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 4,
      name: 'Organic Shea Butter - Raw & Unprocessed',
      price: 15,
      seller: 'Natural Beauty Co',
      quantity: 1,
      inStock: false,
      category: 'Beauty',
      shippingCost: 3.0,
      image:
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGVhJTIwYnV0dGVyfGVufDF8fHx8MTc1ODEyMTQ5MHww&ixlib=rb-4.1.0&q=80&w=1080',
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
      <Header cartCount={cartCount} />
      <CartPageComponent
        cartItems={cartItems}
        onNavigate={onNavigate}
        onUpdateCart={handleUpdateCart}
      />
    </>
  );
}
