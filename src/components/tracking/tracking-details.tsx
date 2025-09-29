'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  ClipboardCopy,
  RefreshCw,
} from 'lucide-react';
import { OrderDetails as OrderDetailsType } from './order-tracking-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrackingTimeline } from './tracking-timeline';
import { OrderItemsCard } from './order-items-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TrackingDetailsProps {
  order: OrderDetailsType;
  onClear: () => void;
}

export function TrackingDetails({ order, onClear }: TrackingDetailsProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const statusInfo = getStatusInfo(order.status);
  const estimatedDate = new Date(order.estimatedDelivery);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${text} has been copied.`,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: 'Tracking Updated',
        description: 'Latest tracking details have been fetched.',
      });
    }, 1500);
  };

  return (
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
                  {order.courierName}
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
              <span className="font-mono">{order.tracking_number}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(order.tracking_number)}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              {order.status === 'delivered'
                ? 'Delivered On'
                : 'Estimated Delivery'}
            </p>
            <p className="font-bold text-lg">
              {order.status === 'delivered' && order.actualDelivery
                ? new Date(order.actualDelivery).toLocaleDateString('en-US', {
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
              <TrackingTimeline events={order.events} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <OrderItemsCard order={order} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
