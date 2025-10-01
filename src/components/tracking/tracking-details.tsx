'use client';
import { useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  FileText,
  Star,
} from 'lucide-react';
import { OrderDetails } from './types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TrackingTimeline } from './tracking-timeline';
import { OrderItemsCard } from './order-items-card';
import { OrderSummaryCard } from './order-summary-card';
import { PaymentDetailsCard } from './payment-details-card';
import { DeliveryInfoCard } from './delivery-info-card';
import { ActionCard } from './action-card';
import { createClient } from '@/lib/supabase/client';

interface TrackingDetailsProps {
  order: OrderDetails;
  onClear: () => void;
  onNavigate: (path: string) => void;
}

export function TrackingDetails({ order, onClear, onNavigate }: TrackingDetailsProps) {
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isConfirming, setIsConfirming] = useState(false);
  const supabase = createClient();

  const handleConfirmReceipt = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch('/api/orders/confirm-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentOrder.id }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to confirm receipt.');
      }
      
      const updatedOrder = await fetchOrderDetails(currentOrder.id);
      if (updatedOrder) {
          setCurrentOrder(updatedOrder);
      }
      
      toast({
        title: 'Order Completed',
        description: 'Thank you for confirming receipt. Payment will be released to the seller.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const fetchOrderDetails = async (orderId: string): Promise<OrderDetails | null> => {
      const { data, error } = await supabase.from('orders').select('*, items:order_items(*, product:products(*, seller:profiles(*)))').eq('id', orderId).single();
      if (error || !data) return null;
      // This mapping logic should ideally be in the API route, but doing it here for speed.
      // A more robust solution would re-use the mapping from the `track` API endpoint.
      return data as unknown as OrderDetails;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onClear} className="pl-0 text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to search
      </Button>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <div className="text-muted-foreground text-sm">
          <span>Order # {currentOrder.id.substring(0, 8)}</span>
          <span className="mx-2">|</span>
          <span>
            Placed on{' '}
            {new Date(currentOrder.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsCard order={currentOrder} onNavigate={onNavigate} />
          <Card>
            <CardHeader>
              <CardTitle>Shipment History</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={currentOrder.events} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky top-24">
           <ActionCard
                orderStatus={currentOrder.status}
                onConfirmReceipt={handleConfirmReceipt}
                isConfirming={isConfirming}
            />
          <PaymentDetailsCard payment={currentOrder.payment} />
          <DeliveryInfoCard shippingAddress={currentOrder.shippingAddress} />
        </div>
      </div>
    </div>
  );
}
