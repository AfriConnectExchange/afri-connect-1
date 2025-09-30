
'use client';
import { useState, useEffect } from 'react';
import { MoreHorizontal, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { ShipOrderDialog } from './ship-order-dialog';

interface OrderItem {
    id: string;
    product: {
        title: string;
        images: string[];
    };
    quantity: number;
    price_at_purchase: string;
}
export interface Sale {
    id: string;
    created_at: string;
    total_amount: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    buyer: {
        full_name: string;
    } | null;
    order_items: OrderItem[];
}

function SalesSkeleton() {
    return (
        <Card className="hidden sm:block">
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

export function SalesPageComponent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const { toast } = useToast();

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
  }, [toast]);

  const handleOpenShipModal = (order: Sale) => {
    setSelectedOrder(order);
    setIsShipModalOpen(true);
  };
  
  const handleConfirmShipment = async (orderId: string, courierName: string, trackingNumber: string) => {
    try {
        const response = await fetch('/api/sales/ship', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, courierName, trackingNumber }),
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to update order.');
        }

        toast({
            title: 'Order Shipped',
            description: `Order ${orderId} has been marked as shipped.`,
        });
        
        fetchSales(); // Refresh the list
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    }
  };


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'processing': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'outline';
      default: return 'destructive';
    }
  }

  return (
    <>
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Sales</h1>
          <p className="text-sm text-muted-foreground">
            Manage your incoming orders and shipments.
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
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.map((sale) => (
                    <TableRow key={sale.id}>
                        <TableCell className="font-medium">#{sale.id.substring(0, 8)}</TableCell>
                        <TableCell>{sale.buyer?.full_name || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(sale.status)} className="capitalize">
                                {sale.status}
                            </Badge>
                        </TableCell>
                        <TableCell>£{parseFloat(sale.total_amount).toFixed(2)}</TableCell>
                        <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {sale.status === 'processing' && (
                                <DropdownMenuItem onSelect={() => handleOpenShipModal(sale)}>Mark as Shipped</DropdownMenuItem>
                            )}
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
              <h3 className="text-lg font-medium">No sales yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                When a customer places an order, it will appear here.
              </p>
            </CardContent>
        </Card>
      )}
    </div>
    {selectedOrder && (
        <ShipOrderDialog
            isOpen={isShipModalOpen}
            onClose={() => setIsShipModalOpen(false)}
            order={selectedOrder}
            onConfirm={handleConfirmShipment}
        />
    )}
    </>
  );
}
