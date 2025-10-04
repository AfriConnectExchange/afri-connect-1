'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Package, Loader2, ArrowRight, ArrowLeft, Download, Search, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';

export interface Order {
    id: string;
    created_at: string;
    total_amount: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    order_items: {
        product: {
            title: string;
            images: string[];
        }
    }[];
}

function OrdersSkeleton() {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-5 w-3/4" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-1/2" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-1/2" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-1/2" /></TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/orders/list');
        if (res.ok) {
            const data = await res.json();
            setOrders(data);
        } else {
            const errorData = await res.json();
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorData.error || 'Failed to fetch your orders.',
            });
        }
      } catch (error) {
          toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not connect to the server.',
            });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'processing': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'outline';
      default: return 'destructive';
    }
  }

  const handleTrackOrder = (orderId: string) => {
    router.push(`/tracking?orderId=${orderId}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            View your order history and track your deliveries.
          </p>
        </div>
      </div>

      {isLoading ? (
        <OrdersSkeleton />
      ) : orders.length > 0 ? (
        <Card>
            <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => handleTrackOrder(order.id)}>
                        <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(order.status)} className="capitalize">
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{order.order_items?.length || 0} item(s)</TableCell>
                        <TableCell className="text-right">£{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      ) : (
         <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                When you make a purchase, it will appear here.
              </p>
               <Button onClick={() => router.push('/marketplace')}>Start Shopping</Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
