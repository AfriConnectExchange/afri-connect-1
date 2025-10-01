'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderDetails } from './types';

interface DeliveryInfoCardProps {
  shippingAddress: OrderDetails['shippingAddress'];
}

export function DeliveryInfoCard({ shippingAddress }: DeliveryInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p className="font-medium">{shippingAddress.name}</p>
        <p className="text-muted-foreground">{shippingAddress.street}</p>
        <p className="text-muted-foreground">{shippingAddress.city}, {shippingAddress.postcode}</p>
        <p className="text-muted-foreground">{shippingAddress.phone}</p>
      </CardContent>
    </Card>
  );
}
