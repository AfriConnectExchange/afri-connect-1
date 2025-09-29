'use client'
import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '../ui/loader';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function EmbeddedCheckout() {
  const { toast } = useToast();

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        // In a real app, you would pass the cart items here.
        // For this simplified example, the API side creates dummy line items.
        body: JSON.stringify({
            cartItems: [] // This needs to be populated from context in a real scenario.
        })
      });
      const data = await response.json();
      if(response.ok) {
        return data.clientSecret;
      } else {
        throw new Error(data.error || 'Failed to fetch client secret');
      }
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message
        });
        return '';
    }
  }, [toast]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
