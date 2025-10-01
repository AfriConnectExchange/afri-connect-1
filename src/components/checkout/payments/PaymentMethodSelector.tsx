'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Shield, Handshake, Truck } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'online' | 'direct';
  icon: React.ReactNode;
  description: string;
  recommended?: boolean;
  maxAmount?: number;
  fees: string;
}

const paymentMethods: PaymentMethod[] = [
    {
        id: 'card',
        name: 'Card Payment',
        type: 'online',
        icon: <CreditCard className="w-5 h-5" />,
        description: 'Visa, Mastercard, etc. via Stripe',
        fees: '~2.9% + £0.30'
    },
    {
        id: 'wallet',
        name: 'Digital Wallet',
        type: 'online',
        icon: <div className="flex items-center gap-2 h-6">
                <Image src="/paypal.svg" alt="PayPal" width={60} height={15} />
                <Image src="/apple-pay.svg" alt="Apple Pay" width={40} height={15} />
            </div>,
        description: 'PayPal, Apple Pay, etc.',
        fees: 'Varies'
    },
    {
        id: 'flutterwave',
        name: 'Flutterwave',
        type: 'online',
        icon: <Image src="/flutterwave.svg" alt="Flutterwave" width={100} height={20} />,
        description: 'Mobile money & more',
        fees: 'Varies'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      type: 'direct',
      icon: <Truck className="w-5 h-5" />,
      description: 'Pay when you receive your order',
      maxAmount: 1000,
      fees: 'Free'
    },
    {
      id: 'barter',
      name: 'Barter Exchange',
      type: 'direct',
      icon: <Handshake className="w-5 h-5" />,
      description: 'Exchange goods or services',
      fees: 'Free'
    }
];

interface PaymentMethodSelectorProps {
  orderTotal: number;
  onSelectMethod: (method: any) => void; // Keeping 'any' for flexibility as the object is complex now
  selectedMethod?: string;
}

export function PaymentMethodSelector({ orderTotal, onSelectMethod, selectedMethod }: PaymentMethodSelectorProps) {

  const handleSelect = (method: PaymentMethod) => {
    // When an "online" method is selected, we want to trigger the escrow flow.
    // The specific form (card, wallet, etc.) can be determined later.
    // For now, let's treat all online payments as triggering the secure flow.
    if (method.type === 'online') {
        // We pass the specific method but also imply it's an escrow-protected one
        onSelectMethod({ ...method, isEscrow: true, id: 'escrow' }); // Override id to 'escrow' to trigger correct form
    } else {
        onSelectMethod({ ...method, isEscrow: false });
    }
  }
  
  const onlineMethods = paymentMethods.filter(m => m.type === 'online');
  const directMethods = paymentMethods.filter(m => m.type === 'direct' && orderTotal <= (m.maxAmount || Infinity));

  return (
    <Card>
        <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

            {/* Secure Escrow Payment Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                        <h3 className="font-semibold text-base">Secure Escrow Payment <Badge className="bg-green-100 text-green-700">Recommended</Badge></h3>
                        <p className="text-sm text-muted-foreground">Your payment is held securely until you confirm delivery.</p>
                    </div>
                </div>
                <div className="pl-9 space-y-3">
                    {onlineMethods.map(method => (
                        <div key={method.id} onClick={() => handleSelect(method)} className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between",
                            selectedMethod === 'escrow' ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
                        )}>
                            <div className="flex items-center gap-3">
                                {method.icon}
                                <div>
                                    <p className="font-medium text-sm">{method.name}</p>
                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                            </div>
                            {selectedMethod === 'escrow' && <Check className="w-5 h-5 text-primary" />}
                        </div>
                    ))}
                </div>
            </div>

            <Separator />
            
            {/* Direct Payment Section */}
            <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold text-base">Direct Payment</h3>
                        <p className="text-sm text-muted-foreground">Payment is not protected by AfriConnect Escrow.</p>
                    </div>
                </div>
                 <div className="pl-9 space-y-3">
                    {directMethods.map(method => (
                         <div key={method.id} onClick={() => handleSelect(method)} className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between",
                            selectedMethod === method.id ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
                        )}>
                            <div className="flex items-center gap-3">
                                {method.icon}
                                <div>
                                    <p className="font-medium text-sm">{method.name}</p>
                                     <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                            </div>
                             {selectedMethod === method.id && <Check className="w-5 h-5 text-primary" />}
                        </div>
                    ))}
                </div>
            </div>

        </CardContent>
    </Card>
  );
}