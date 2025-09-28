'use client';
import { OrderDetails } from './order-tracking-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

interface OrderItemsCardProps {
  order: OrderDetails;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Items in Shipment</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  £{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Shipping Address</h3>
          <div className="flex gap-4">
            <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.street}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city},{' '}
                {order.shippingAddress.postcode}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
