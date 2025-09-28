'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Wallet, Shield, Lock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface OnlinePaymentFormProps {
  orderTotal: number;
  paymentType: 'card' | 'wallet';
  onConfirm: (data: any) => void;
  onCancel: () => void;
}

export function OnlinePaymentForm({ orderTotal, paymentType, onConfirm, onCancel }: OnlinePaymentFormProps) {
  const [formData, setFormData] = useState({
    // Card details
    cardholderName: '',
    
    // Wallet details
    walletProvider: '',
    walletEmail: '',
    
    // Billing
    billingAddress: {
      postcode: '',
      country: 'UK'
    },
    
    savePaymentMethod: false,
    agreeTerms: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const walletProviders = [
    { id: 'paypal', name: 'PayPal', icon: <Image src="/paypal-logo.svg" alt="PayPal" width={60} height={20} /> },
    { id: 'applepay', name: 'Apple Pay', icon: <Image src="/apple-pay.svg" alt="Apple Pay" width={50} height={20} /> },
    { id: 'googlepay', name: 'Google Pay', icon: <Image src="/google-pay.svg" alt="Google Pay" width={50} height={20} /> }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBillingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentType === 'card') {
      if (!formData.cardholderName) {
        newErrors.cardholderName = 'Please enter cardholder name';
      }
    } else {
      if (!formData.walletProvider) {
        newErrors.walletProvider = 'Please select a wallet provider';
      }
      if (!formData.walletEmail) {
        newErrors.walletEmail = 'Please enter your wallet email';
      }
    }

    if (!formData.billingAddress.postcode) {
      newErrors.postcode = 'Please enter billing postcode';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Please agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // In a real app, you would get a token from the Payment Element and send it to your server
    setTimeout(() => {
      const success = Math.random() > 0.1;
      
      if (success) {
        onConfirm({
          paymentMethod: paymentType === 'card' ? 'online_card' : 'online_wallet',
          paymentDetails: paymentType === 'card' ? {
            last4: '4242', // Mock data from token
            cardType: 'Visa', // This would come from a card detection library
            saved: formData.savePaymentMethod
          } : {
            provider: formData.walletProvider,
            email: formData.walletEmail
          },
          orderTotal,
          status: 'Paid',
          transactionId: `TXN${Date.now()}`,
          processingTime: new Date().toISOString()
        });
      } else {
        setErrors({ payment: 'Payment failed. Please try again or use another method.' });
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  const processingFee = orderTotal * 0.029 + 0.30;
  const totalWithFees = orderTotal + processingFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {paymentType === 'card' ? <CreditCard className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
          <span>{paymentType === 'card' ? 'Card Payment' : 'Digital Wallet'}</span>
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Secure
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span>Order Total:</span>
            <span>£{orderTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Processing Fee:</span>
            <span>£{processingFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total to Pay:</span>
            <span>£{totalWithFees.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        {paymentType === 'card' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2 h-6">
                <Image src="/stripe.svg" alt="Stripe" width={50} height={20}/>
                <Image src="/paypal.svg" alt="PayPal" width={60} height={20}/>
            </div>

            {/* SECURE PAYMENT ELEMENT PLACEHOLDER */}
            <div className="space-y-2">
              <Label>Card Information</Label>
              <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background flex items-center justify-between text-muted-foreground">
                <span>Card Number, Expiry, CVV</span>
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground">Your card details are securely handled by our payment partner.</p>
            </div>

            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Smith"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              />
              {errors.cardholderName && <p className="text-destructive text-sm mt-1">{errors.cardholderName}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="walletProvider">Wallet Provider *</Label>
              <Select onValueChange={(value) => handleInputChange('walletProvider', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your wallet provider" />
                </SelectTrigger>
                <SelectContent>
                  {walletProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center space-x-2">
                        {provider.icon}
                        <span>{provider.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.walletProvider && <p className="text-destructive text-sm mt-1">{errors.walletProvider}</p>}
            </div>

            <div>
              <Label htmlFor="walletEmail">Email Address *</Label>
              <Input
                id="walletEmail"
                type="email"
                placeholder="your.email@example.com"
                value={formData.walletEmail}
                onChange={(e) => handleInputChange('walletEmail', e.target.value)}
              />
              {errors.walletEmail && <p className="text-destructive text-sm mt-1">{errors.walletEmail}</p>}
            </div>
          </div>
        )}

        {/* Billing Address */}
        <div className="space-y-4">
          <Label className="text-base">Billing Address</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                placeholder="SW1A 1AA"
                value={formData.billingAddress.postcode}
                onChange={(e) => handleBillingChange('postcode', e.target.value)}
              />
              {errors.postcode && <p className="text-destructive text-sm mt-1">{errors.postcode}</p>}
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.billingAddress.country} onValueChange={(value) => handleBillingChange('country', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="IE">Ireland</SelectItem>
                  {/* Add more countries as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="savePayment"
              checked={formData.savePaymentMethod}
              onCheckedChange={(checked) => handleInputChange('savePaymentMethod', !!checked)}
            />
            <Label htmlFor="savePayment" className="text-sm">
              Save this payment method for future purchases
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeTerms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
            />
            <Label htmlFor="agreeTerms" className="text-sm">
              I agree to the payment terms and authorize this transaction. *
            </Label>
          </div>
          {errors.agreeTerms && <p className="text-destructive text-sm">{errors.agreeTerms}</p>}
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment information is encrypted and secure. We never store your full card details.
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {errors.payment && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.payment}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
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
            onClick={handleSubmit}
            disabled={isProcessing || !formData.agreeTerms}
            className="flex-1"
          >
            {isProcessing ? 'Processing Payment...' : `Pay £${totalWithFees.toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
