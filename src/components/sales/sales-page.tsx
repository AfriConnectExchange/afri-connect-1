
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Package, Loader2, Truck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { ShipOrderModal } from './ship-order-modal';

export interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  buyer: {
    full_name: string;
  };
}

function SalesSkeleton() {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-5 w-3/4" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-1/2" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-1/2" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-1/2" />
            </TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-3/4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-1/2" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-1/2" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-20 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sales/list');
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      } else {
        const errorData = await res.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.error || 'Failed to fetch your sales.',
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

  useEffect(() => {
    fetchSales();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const handleShipOrder = (order: Sale) => {
    setSelectedOrder(order);
  };
  
  const onOrderShipped = () => {
    setSelectedOrder(null);
    fetchSales(); // Re-fetch sales to show the updated status
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Sales</h1>
          <p className="text-sm text-muted-foreground">
            Manage your orders and fulfill them for your customers.
          </p>
        </div>
      </div>

      {isLoading ? (
        <SalesSkeleton />
      ) : sales.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => router.push(`/tracking?orderId=${sale.id}`)}
                    >
                      #{sale.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{sale.buyer.full_name}</TableCell>
                    <TableCell>
                      {new Date(sale.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(sale.status)}
                        className="capitalize"
                      >
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      £{sale.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={() => handleShipOrder(sale)}
                        >
                          <Truck className="w-4 h-4 mr-2" /> Ship Order
                        </Button>
                      )}
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No sales yet</h3>
            <p className="max-w-xs mx-auto text-sm text-muted-foreground">
              When a customer places an order, it will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedOrder && (
        <ShipOrderModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderShipped={onOrderShipped}
        />
      )}
    </div>
  );
}
