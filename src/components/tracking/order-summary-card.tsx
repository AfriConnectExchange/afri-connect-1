'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderDetails } from './types';

interface OrderSummaryCardProps {
  order: OrderDetails;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono">#{order.id.substring(0, 8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Date</span>
          <span>{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Status</span>
          <span className="font-semibold capitalize">{order.status}</span>
        </div>
      </CardContent>
    </Card>
  );
}
