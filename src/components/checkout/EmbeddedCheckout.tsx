'use client';
import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '../ui/loader';
import { useCart } from '@/context/cart-context';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Changed function name from EmbeddedCheckout to CheckoutForm
export function CheckoutForm() {
  const { toast } = useToast();
  const { cart } = useCart();

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cart,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.clientSecret;
      } else {
        throw new Error(data.error || 'Failed to fetch client secret');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      return '';
    }
  }, [toast, cart]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}