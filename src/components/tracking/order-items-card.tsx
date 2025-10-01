'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { OrderDetails } from './types';

interface OrderItemsCardProps {
  order: OrderDetails;
  onNavigate: (path: string) => void;
}

export function OrderItemsCard({ order, onNavigate }: OrderItemsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items in this order ({order.items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <p className="font-medium line-clamp-2">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Sold by:{' '}
                <span
                  onClick={() => onNavigate(`/seller/${item.seller.id}`)}
                  className="text-primary hover:underline cursor-pointer"
                >
                  {item.seller.name}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-sm">
              £{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
