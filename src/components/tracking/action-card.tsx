'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActionCardProps {
  orderStatus: 'pending' | 'processing' | 'shipped' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'failed';
  onConfirmReceipt: () => void;
  isConfirming: boolean;
}

export function ActionCard({ orderStatus, onConfirmReceipt, isConfirming }: ActionCardProps) {
    const router = useRouter();

    const renderContent = () => {
        switch(orderStatus) {
            case 'shipped':
            case 'out-for-delivery':
            case 'in-transit':
                return (
                    <div className="text-center space-y-3">
                        <h3 className="font-semibold">Have you received your order?</h3>
                        <p className="text-sm text-muted-foreground">Confirming receipt will release the payment to the seller.</p>
                        <Button className="w-full" onClick={onConfirmReceipt} disabled={isConfirming}>
                            {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Receipt
                        </Button>
                    </div>
                );
            case 'delivered':
                return (
                    <div className="text-center space-y-3">
                        <h3 className="font-semibold">Order Delivered!</h3>
                        <p className="text-sm text-muted-foreground">Thank you for your purchase. We hope you enjoy your items.</p>
                        <Button className="w-full" onClick={() => router.push('/reviews')}>Leave a Review</Button>
                    </div>
                );
             case 'processing':
                return (
                     <div className="text-center space-y-3">
                        <h3 className="font-semibold">Awaiting Shipment</h3>
                        <p className="text-sm text-muted-foreground">The seller is preparing your order. You will be notified once it ships.</p>
                    </div>
                )
            default:
                return null;
        }
    }
  
  const content = renderContent();
  if (!content) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
        <div className="text-center mt-4">
            <Button variant="link" size="sm" className="text-muted-foreground h-auto p-1">Raise a Dispute</Button>
            <span className="text-muted-foreground mx-1">·</span>
            <Button variant="link" size="sm" className="text-muted-foreground h-auto p-1">Contact Seller</Button>
        </div>
      </CardContent>
    </Card>
  );
}
