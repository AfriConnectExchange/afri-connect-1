'use client';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Wallet, Shield, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { CheckoutForm as EmbeddedCheckout } from '@/components/checkout/EmbeddedCheckout';

interface OnlinePaymentFormProps {
  orderTotal: number;
  paymentType: 'card' | 'wallet' | 'flutterwave';
  onConfirm: (data: any) => void;
  onCancel: () => void;
}

export function OnlinePaymentForm({ orderTotal, paymentType, onConfirm, onCancel }: OnlinePaymentFormProps) {
  const { cart } = useCart();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);

  const handleProceedToStripe = () => {
    setShowStripeForm(true);
  }

  const renderTitle = () => {
    switch (paymentType) {
      case 'card': return 'Card Payment';
      case 'wallet': return 'Digital Wallet';
      case 'flutterwave': return 'Pay with Flutterwave';
      default: return 'Online Payment';
    }
  }

  const renderIcon = () => {
    switch(paymentType) {
        case 'card': return <CreditCard className="w-5 h-5" />;
        case 'wallet': return <Wallet className="w-5 h-5" />;
        case 'flutterwave': return <Image src="/flutterwave.svg" alt="Flutterwave" width={20} height={20} />;
        default: return <CreditCard className="w-5 h-5" />;
    }
  }

  if (showStripeForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {renderIcon()}
            <span>{renderTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
           <EmbeddedCheckout />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {renderIcon()}
          <span>{renderTitle()}</span>
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Secure
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span>Order Total:</span>
            <span>£{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        {paymentType === 'card' && (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2 h-6">
                <p className="text-xs text-muted-foreground">Powered by</p>
                <Image src="/stripe.svg" alt="Stripe" width={50} height={20}/>
            </div>
            
            <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                    You will be redirected to our secure payment partner, Stripe, to complete your purchase. Your payment details are never stored on our servers.
                </AlertDescription>
            </Alert>
          </div>
        )}

        {paymentType === 'wallet' && (
           <Alert>
            <AlertDescription>
                Digital wallet payments are not yet supported. Please choose another payment method.
            </AlertDescription>
          </Alert>
        )}

        {paymentType === 'flutterwave' && (
            <Alert>
                <AlertDescription>
                   Flutterwave payments are not yet supported. Please choose another payment method.
                </AlertDescription>
            </Alert>
        )}
        
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Change Payment Method
          </Button>
          <Button
            onClick={handleProceedToStripe}
            disabled={isProcessing || paymentType !== 'card'}
            className="flex-1"
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isProcessing ? 'Redirecting...' : `Proceed to Secure Payment`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
