
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Package, Truck } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
    product: {
        title: string;
        images: string[];
    }
}

interface Order {
  id: string;
  created_at: string;
  total_amount: string;
  status: string;
  order_items: OrderItem[];
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
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
        const response = await fetch('/api/orders/list');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message,
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
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default: return 'secondary';
    }
  };

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
             <Button onClick={() => router.push('/marketplace')}>Shop Now</Button>
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
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    {order.order_items[0]?.product?.images?.[0] && 
                                        <Image src={order.order_items[0].product.images[0]} alt={order.order_items[0].product.title} width={40} height={40} className="rounded-md object-cover" />
                                    }
                                    <span className="truncate max-w-xs">{order.order_items.map(item => item.product.title).join(', ')}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                            </TableCell>
                            <TableCell>£{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                             <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order.id)}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Track
                                </Button>
                            </TableCell>
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
                    It looks like you haven't placed any orders. Let's change that!
                </p>
                <Button onClick={() => router.push('/marketplace')}>Start Shopping</Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
