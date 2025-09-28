'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = useCallback((item: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        // If item exists, update its quantity
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // If item doesn't exist, add it to the cart
        return [...prevCart, { ...item, quantity }];
      }
    });
    toast({
      title: 'Item Added to Cart',
      description: `${item.name} has been added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast({
        variant: 'destructive',
        title: 'Item Removed',
        description: `Item has been removed from your cart.`,
    });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    toast({
        variant: 'destructive',
        title: 'Cart Cleared',
        description: `All items have been removed from your cart.`,
    });
  }, [toast]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
