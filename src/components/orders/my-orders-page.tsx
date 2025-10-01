'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

interface OrderItem {
    product: {
        title: string;
        images: string[];
    }
}

export interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    order_items: OrderItem[];
}

function OrdersSkeleton() {
    return (
        <Card>
            <CardHeader>
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
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
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await res.json();
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
            default: return 'destructive';
        }
    }
    
    const handleRowClick = (orderId: string) => {
        router.push(`/tracking?orderId=${orderId}`);
    };

    if (isLoading) {
        return <OrdersSkeleton />;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>View and track your purchase history.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
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
                                    <TableRow key={order.id} className="cursor-pointer" onClick={() => handleRowClick(order.id)}>
                                        <TableCell className="font-mono">#{order.id.substring(0, 8)}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{order.order_items.length} item(s)</TableCell>
                                        <TableCell className="text-right font-medium">£{order.total_amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold text-lg">No orders yet</h3>
                            <p className="text-muted-foreground mb-6">Your past orders will appear here.</p>
                            <Button onClick={() => router.push('/marketplace')}>Start Shopping</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
