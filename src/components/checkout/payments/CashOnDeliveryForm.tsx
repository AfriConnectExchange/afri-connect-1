'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, MapPin, Clock, AlertTriangle } from 'lucide-react';

interface CashOnDeliveryFormProps {
  orderTotal: number;
  onConfirm: (data: any) => void;
  onCancel: () => void;
}

export function CashOnDeliveryForm({ orderTotal, onConfirm, onCancel }: CashOnDeliveryFormProps) {
  const [formData, setFormData] = useState({
    deliveryAddress: {
      street: '',
      city: '',
      postcode: '',
      phone: '',
      instructions: ''
    },
    preferredTime: 'anytime',
    confirmTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddress: {
        ...prev.deliveryAddress,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.confirmTerms) {
      alert('Please confirm the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm({
        paymentMethod: 'cash_on_delivery',
        deliveryAddress: formData.deliveryAddress,
        preferredTime: formData.preferredTime,
        orderTotal,
        status: 'Cash Pending'
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const isFormValid = formData.deliveryAddress.street && 
                     formData.deliveryAddress.city && 
                     formData.deliveryAddress.postcode && 
                     formData.deliveryAddress.phone && 
                     formData.confirmTerms;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5" />
          <span>Cash on Delivery</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span>Total Amount to Pay on Delivery:</span>
            <span className="text-lg font-semibold">£{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <Label className="text-base">Delivery Address</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                placeholder="123 Main Street"
                value={formData.deliveryAddress.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="London"
                value={formData.deliveryAddress.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                placeholder="SW1A 1AA"
                value={formData.deliveryAddress.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="+44 7XXX XXXXXX"
                value={formData.deliveryAddress.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Ring doorbell twice, leave with neighbor if not home"
              value={formData.deliveryAddress.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Preferred Delivery Time */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <Label className="text-base">Preferred Delivery Time</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['anytime', 'morning', 'afternoon', 'evening'].map((time) => (
              <label key={time} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md hover:bg-muted has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                <input
                  type="radio"
                  name="preferredTime"
                  value={time}
                  checked={formData.preferredTime === time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="capitalize text-sm">{time === 'anytime' ? 'Anytime' : `${time} (${
                  time === 'morning' ? '9AM-12PM' :
                  time === 'afternoon' ? '12PM-6PM' : '6PM-9PM'
                })`}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Please have the exact amount (£{orderTotal.toFixed(2)}) ready in cash. 
            Our delivery partner will confirm your order details before accepting payment.
          </AlertDescription>
        </Alert>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={formData.confirmTerms}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmTerms: !!checked }))}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            I understand that payment will be collected upon delivery. I agree to be available 
            at the specified address during the delivery window and have the exact payment amount ready.
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Change Payment Method
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Processing Order...' : 'Confirm Cash on Delivery'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
