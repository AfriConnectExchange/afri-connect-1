'use client';

import { useEffect, useState } from 'react';
import { CheckoutPageComponent } from '@/components/checkout/checkout-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useCart } from '@/context/cart-context';
import { PaymentConfirmation } from '@/components/checkout/payments/PaymentConfirmation';
import type { CartItem } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';


export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, cartCount, subtotal, clearCart } = useCart();
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderData, setOrderData] = useState({
    confirmedOrderItems: [] as CartItem[],
    confirmedOrderTotal: 0,
  });

  const [checkoutStep, setCheckoutStep] = useState<'summary' | 'payment' | 'confirmation'>('summary');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  const handlePaymentSuccess = async (paymentDetails: any) => {
    // This is the successful payment callback
    
    // Create the order in the database
    const orderPayload = {
      cartItems: cart,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: selectedPaymentMethod.id,
      shippingAddress: {
        street: '123 Example Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        phone: '+44 7700 900123',
      },
      paymentDetails,
    };
    
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order.');
      }
      
      // 1. Store the successful order details for the confirmation page
      setOrderData({
        confirmedOrderItems: cart,
        confirmedOrderTotal: total,
      });

      // Pass the successful API result to the confirmation page
      setPaymentData({ ...result.order, ...paymentDetails });

      // 2. NOW it's safe to clear the cart
      clearCart();

      // 3. Move to the final confirmation screen
      setCheckoutStep('confirmation');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Order Creation Failed',
            description: error.message,
        });
        // Do not clear cart, allow user to retry
    }
  };

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };
  
   useEffect(() => {
    // If the user lands on the checkout page with an empty cart and it's not a confirmation, redirect them.
    if (cart.length === 0 && checkoutStep !== 'confirmation') {
      router.push('/cart');
    }
  }, [cart, router, checkoutStep]);

  if (checkoutStep === 'confirmation' && paymentData) {
    return (
        <>
            <Header cartCount={0} /> 
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                <PaymentConfirmation
                    paymentData={paymentData}
                    orderItems={orderData.confirmedOrderItems}
                    orderTotal={orderData.confirmedOrderTotal}
                    onNavigate={onNavigate}
                />
                </div>
            </div>
        </>
    );
  }

  return (
    <>
      <Header cartCount={cartCount}/>
      <CheckoutPageComponent
        cartItems={cart}
        subtotal={subtotal}
        onNavigate={onNavigate}
        onPaymentSuccess={handlePaymentSuccess}
        checkoutStep={checkoutStep}
        setCheckoutStep={setCheckoutStep}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
      />
    </>
  );
}
