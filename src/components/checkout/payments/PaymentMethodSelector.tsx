'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Shield, Handshake, Truck } from 'lucide-react';
import Image from 'next/image';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'online_card' | 'online_wallet' | 'escrow' | 'barter';
  icon: React.ReactNode;
  description: string;
  ranking: number;
  recommended?: boolean;
  maxAmount?: number;
  processingTime: string;
  fees: string;
}

interface PaymentMethodSelectorProps {
  orderTotal: number;
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethod?: string;
}

export function PaymentMethodSelector({ orderTotal, onSelectMethod, selectedMethod }: PaymentMethodSelectorProps) {
  const [methods] = useState<PaymentMethod[]>([
    {
      id: 'escrow',
      name: 'Escrow Payment',
      type: 'escrow',
      icon: <Shield className="w-5 h-5" />,
      description: 'Secure payment held until delivery confirmed',
      ranking: 1,
      recommended: true,
      processingTime: 'Instant',
      fees: '2.5% + £0.30'
    },
    {
      id: 'card',
      name: 'Card Payment',
      type: 'online_card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Visa, Mastercard, etc. via Stripe',
      ranking: 2,
      processingTime: 'Instant',
      fees: '2.9% + £0.30'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      type: 'online_wallet',
      icon: <div className="flex items-center gap-2 h-6">
              <Image src="/paypal.svg" alt="PayPal" width={60} height={15} />
              <Image src="/apple-pay.svg" alt="Apple Pay" width={40} height={15} />
              <Image src="/google-pay.svg" alt="Google Pay" width={40} height={15} />
            </div>,
      description: 'PayPal, Apple Pay, Google Pay',
      ranking: 3,
      processingTime: 'Instant',
      fees: 'Varies'
    },
     {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'online_wallet',
      icon: <Image src="/flutterwave.svg" alt="Flutterwave" width={100} height={20} />,
      description: 'Mobile money, bank transfer, and more',
      ranking: 4,
      processingTime: 'Instant',
      fees: 'Varies'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      type: 'cash',
      icon: <Truck className="w-5 h-5" />,
      description: 'Pay when you receive your order',
      ranking: 5,
      maxAmount: 1000,
      processingTime: 'On delivery',
      fees: 'Free'
    },
    {
      id: 'barter',
      name: 'Barter Exchange',
      type: 'barter',
      icon: <Handshake className="w-5 h-5" />,
      description: 'Exchange goods or services',
      ranking: 6,
      processingTime: 'By agreement',
      fees: 'Free'
    }
  ]);

  const availableMethods = methods.filter(method => {
    if (method.type === 'cash' && orderTotal > (method.maxAmount || Infinity)) {
      return false;
    }
    return true;
  });

  const sortedMethods = availableMethods.sort((a, b) => a.ranking - b.ranking);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {sortedMethods.map((method, index) => (
            <Card 
                key={method.id}
                className={`cursor-pointer transition-all duration-200 ${
                selectedMethod === method.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onSelectMethod(method)}
            >
                <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg flex items-center justify-center ${
                        method.type === 'escrow' ? 'bg-green-100 text-green-600' :
                        method.type.startsWith('online') ? 'bg-blue-100 text-blue-600' :
                        method.type === 'cash' ? 'bg-orange-100 text-orange-600' :
                        'bg-purple-100 text-purple-600'
                    }`}>
                        {method.id === 'wallet' || method.id === 'flutterwave' ? (
                            <div className="h-5 w-auto flex items-center">{method.icon}</div>
                        ) : (
                            method.icon
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                        <span className="font-medium">{method.name}</span>
                        {method.recommended && (
                            <Badge variant="default" className="text-xs h-5">
                            Recommended
                            </Badge>
                        )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Processing: {method.processingTime}</span>
                        <span>Fees: {method.fees}</span>
                        </div>
                    </div>
                    </div>

                    <div className="flex items-center space-x-2">
                    {selectedMethod === method.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                    )}
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}
        </CardContent>
    </Card>
  );
}
