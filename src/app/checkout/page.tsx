'use client';

import { useState } from 'react';
import { CheckoutPageComponent } from '@/components/checkout/checkout-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useCart } from '@/context/cart-context';
import { PaymentConfirmation } from '@/components/checkout/payments/PaymentConfirmation';
import type { CartItem } from '@/context/cart-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, subtotal, clearCart } = useCart();
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderData, setOrderData] = useState({
    confirmedOrderItems: [] as CartItem[],
    confirmedOrderTotal: 0,
  });

  // This state will control what the user sees: summary, payment form, or final confirmation
  const [checkoutStep, setCheckoutStep] = useState<'summary' | 'payment' | 'confirmation'>('summary');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);


  const handlePaymentSuccess = (data: any) => {
    // This is the successful payment callback
    // 1. Store the successful order details for the confirmation page
    setOrderData({
        confirmedOrderItems: cart,
        confirmedOrderTotal: subtotal + (subtotal > 50 ? 0 : 4.99), // Recalculate total for safety
    });
    setPaymentData(data);
    
    // 2. NOW it's safe to clear the cart
    clearCart();

    // 3. Move to the final confirmation screen
    setCheckoutStep('confirmation');
  };

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

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
