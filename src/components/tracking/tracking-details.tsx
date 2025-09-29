
'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  ClipboardCopy,
  RefreshCw,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { OrderDetails as OrderDetailsType } from './order-tracking-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrackingTimeline } from './tracking-timeline';
import { OrderItemsCard } from './order-items-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '../ui/confirmation-modal';

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
  
  const getStatusInfo = (
    status: OrderDetailsType['status']
  ): { color: string; progress: number; label: string } => {
    switch (status) {
      case 'pending':
      case 'processing':
        return {
          color: 'bg-gray-500',
          progress: 10,
          label: 'Processing',
        };
      case 'shipped':
        return {
          color: 'bg-blue-500',
          progress: 40,
          label: 'Shipped',
        };
      case 'in-transit':
        return {
          color: 'bg-yellow-500',
          progress: 70,
          label: 'In Transit',
        };
      case 'out-for-delivery':
        return {
          color: 'bg-orange-500',
          progress: 90,
          label: 'Out for Delivery',
        };
      case 'delivered':
        return {
          color: 'bg-green-500',
          progress: 100,
          label: 'Delivered',
        };
      case 'failed':
        return {
          color: 'bg-red-500',
          progress: 100,
          label: 'Delivery Failed',
        };
      default:
        return { color: 'bg-gray-500', progress: 0, label: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(currentOrder.status);
  const estimatedDate = new Date(currentOrder.estimatedDelivery);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${text} has been copied.`,
    });
  };

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
            description: `Thank you for confirming receipt of order ${currentOrder.id}.`,
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

  return (
    <>
    <div className="space-y-6">
      <Button variant="ghost" onClick={onClear} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Track another order
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {statusInfo.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentOrder.courierName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Progress value={statusInfo.progress} className="h-2" />
            <div className="mt-2 text-sm text-muted-foreground flex justify-between">
              <span>Order Placed</span>
              <span>Delivered</span>
            </div>
          </div>
          <div className="text-sm">
            <span className="font-semibold">Tracking Number: </span>
            <div className="inline-flex items-center gap-2">
              <span className="font-mono">{currentOrder.tracking_number}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(currentOrder.tracking_number)}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              {currentOrder.status === 'delivered'
                ? 'Delivered On'
                : 'Estimated Delivery'}
            </p>
            <p className="font-bold text-lg">
              {currentOrder.status === 'delivered' && currentOrder.actualDelivery
                ? new Date(currentOrder.actualDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : estimatedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </p>
          </div>
           {currentOrder.status === 'in-transit' || currentOrder.status === 'out-for-delivery' ? (
                <Button 
                    className="w-full"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isConfirming}
                >
                    {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Receipt of Goods
                </Button>
            ) : currentOrder.status === 'delivered' ? (
                <div className="flex items-center justify-center gap-2 text-green-600 p-2 bg-green-50 border border-green-200 rounded-md">
                   <CheckCircle className="h-4 w-4" />
                   <p className="text-sm font-medium">This order has been completed.</p>
                </div>
            ) : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Tracking Timeline</TabsTrigger>
          <TabsTrigger value="details">Order Details</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipment History</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={currentOrder.events} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <OrderItemsCard order={currentOrder} />
        </TabsContent>
      </Tabs>
    </div>
    
     <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReceipt}
        title="Confirm Receipt"
        description="Are you sure you have received all items in this order in good condition? This action will release the payment to the seller."
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
