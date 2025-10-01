'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderDetails } from './types';

interface PaymentDetailsCardProps {
  payment: OrderDetails['payment'];
}

export function PaymentDetailsCard({ payment }: PaymentDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="capitalize">{payment.method.replace('_', ' ')}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items Total</span>
          <span>£{payment.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>£{payment.deliveryFee.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span>£{payment.total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
