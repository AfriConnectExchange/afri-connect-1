'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  ClipboardCopy,
  RefreshCw,
  CheckCircle,
  Loader2,
  Package,
  CreditCard,
} from 'lucide-react';
import { OrderDetails as OrderDetailsType } from './order-tracking-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrackingTimeline } from './tracking-timeline';
import { OrderItemsCard } from './order-items-card';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '../ui/confirmation-modal';
import { Separator } from '../ui/separator';

interface TrackingDetailsProps {
  order: OrderDetailsType;
  onClear: () => void;
}

export function TrackingDetails({ order, onClear }: TrackingDetailsProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
        const response = await fetch(`/api/orders/track?orderId=${currentOrder.id}`);
        if(response.ok) {
            const data = await response.json();
            setCurrentOrder(data);
            toast({
                title: 'Tracking Updated',
                description: 'Latest tracking details have been fetched.',
            });
        } else {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to refresh tracking details.' });
        }
    } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to server.' });
    } finally {
        setIsRefreshing(false);
    }
  };
  
  const handleConfirmReceipt = async () => {
    setShowConfirmModal(false);
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

        toast({
            title: 'Order Completed',
            description: `Thank you for confirming receipt of order #${currentOrder.id.substring(0,8)}.`,
        });
        
        handleRefresh(); // Refresh to get the final 'delivered' state
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

  const subtotal = currentOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  // Assuming a static delivery fee for now as it's not on the order object
  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  return (
    <>
    <div className="space-y-6">
      <Button variant="ghost" onClick={onClear} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Track another order
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <OrderItemsCard order={currentOrder} />
            <Card>
                <CardHeader>
                    <CardTitle>Shipment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <TrackingTimeline events={currentOrder.events} />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-mono">#{currentOrder.id.substring(0,8)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date</span>
                        <span>{new Date(currentOrder.events[0].timestamp).toLocaleDateString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Status</span>
                        <span className="font-semibold capitalize">{currentOrder.status}</span>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span>Card</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>£{subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>£{deliveryFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>£{total.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
            
             {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
               <Button 
                    className="w-full"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isConfirming}
                >
                    {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Receipt
                </Button>
            )}
        </div>
      </div>
    </div>
    
     <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReceipt}
        title="Confirm Receipt"
        description="Are you sure you have received all items in this order in good condition? This will release payment to the seller."
        confirmText="Yes, I've Received It"
        type="warning"
        consequences={[
          'Payment will be transferred to the seller.',
          'This action cannot be undone.'
        ]}
      />
    </>
  );
}
