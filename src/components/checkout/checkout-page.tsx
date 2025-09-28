'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PaymentMethodSelector } from '@/components/checkout/payments/PaymentMethodSelector';
import { CashOnDeliveryForm } from '@/components/checkout/payments/CashOnDeliveryForm';
import { OnlinePaymentForm } from '@/components/checkout/payments/OnlinePaymentForm';
import { EscrowPaymentForm } from '@/components/checkout/payments/EscrowPaymentForm';
import { BarterProposalForm } from '@/components/checkout/payments/BarterProposalForm';
import { PaymentConfirmation } from '@/components/checkout/payments/PaymentConfirmation';
import { ArrowLeft, ShoppingCart, MapPin, Truck } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import type { CartItem } from '@/components/cart/cart-page';
import Image from 'next/image';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (page: string) => void;
  onUpdateCart: (items: CartItem[]) => void;
}

export function CheckoutPageComponent({
  cartItems,
  onNavigate,
  onUpdateCart,
}: CheckoutPageProps) {
  const [currentStep, setCurrentStep] = useState<
    'summary' | 'payment' | 'confirmation'
  >('summary');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      street: '123 Example Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '+44 7700 900123',
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (cartItems.length === 0 && currentStep !== 'confirmation') {
      onNavigate('cart');
    }
  }, [cartItems, onNavigate, currentStep]);

  const handlePaymentMethodSelect = (method: any) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (data: any) => {
    setPaymentData(data);
    setCurrentStep('confirmation');
    onUpdateCart([]); // Clear cart after successful order
  };

  const handleBackToPaymentSelection = () => {
    setSelectedPaymentMethod(null);
    setCurrentStep('summary');
  };

  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null;

    const props = {
      orderTotal: total,
      onConfirm: handlePaymentSubmit,
      onCancel: handleBackToPaymentSelection,
    };

    switch (selectedPaymentMethod.id) {
      case 'cash':
        return <CashOnDeliveryForm {...props} />;
      case 'card':
        return <OnlinePaymentForm {...props} paymentType="card" />;
      case 'wallet':
        return <OnlinePaymentForm {...props} paymentType="wallet" />;
      case 'escrow':
        return <EscrowPaymentForm {...props} />;
      case 'barter':
        const targetProduct = {
          id: cartItems[0]?.id || 1,
          name: cartItems[0]?.name || 'Product',
          seller: typeof cartItems[0]?.seller === 'string' ? cartItems[0]?.seller : cartItems[0]?.seller?.name || 'Seller',
          estimatedValue: cartItems[0]?.price || total,
        };
        return <BarterProposalForm targetProduct={targetProduct} {...props} />;
      default:
        return null;
    }
  };

  if (currentStep === 'confirmation' && paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PaymentConfirmation
            paymentData={paymentData}
            orderItems={cartItems}
            orderTotal={total}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentStep === 'payment' ? handleBackToPaymentSelection() : onNavigate('cart')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 'payment' ? 'Back to Payment Selection' : 'Back to Cart'}</span>
            </Button>
            <h1 className="text-2xl font-bold mt-2">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'summary' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Delivery Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {orderData.deliveryAddress.street}
                      </p>
                      <p>
                        {orderData.deliveryAddress.city},{' '}
                        {orderData.deliveryAddress.postcode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {orderData.deliveryAddress.phone}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Change Address
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="w-5 h-5" />
                      <span>Delivery Options</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium">Standard Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            3-5 business days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {deliveryFee === 0
                              ? 'FREE'
                              : `£${deliveryFee.toFixed(2)}`}
                          </p>
                          {deliveryFee === 0 && (
                            <p className="text-xs text-green-600">
                              Orders over £50
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <PaymentMethodSelector
                  orderTotal={total}
                  onSelectMethod={handlePaymentMethodSelect}
                  selectedMethod={selectedPaymentMethod?.id}
                />
              </>
            )}

            {currentStep === 'payment' && renderPaymentForm()}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0">
                        <Image src={item.image} alt={item.name} width={48} height={48} className="object-cover rounded-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span>
                      {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedPaymentMethod && (
                  <div className="pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Payment Method:
                      </span>
                      <Badge variant="secondary">
                        {selectedPaymentMethod.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <ConfirmationModal
          isOpen={showPaymentConfirm}
          onClose={() => setShowPaymentConfirm(false)}
          onConfirm={() => {
            setIsProcessingPayment(true);
            // Simulate payment processing
            setTimeout(() => {
                handlePaymentSubmit(paymentData)
                setIsProcessingPayment(false);
                setShowPaymentConfirm(false);
            }, 2000)
          }}
          title="Confirm Payment"
          description={`Are you sure you want to proceed with the payment of £${total.toFixed(2)}?`}
          isLoading={isProcessingPayment}
          type="warning"
        />
      </div>
    </div>
  );
}
