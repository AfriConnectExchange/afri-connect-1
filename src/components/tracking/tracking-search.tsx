'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, AlertCircle } from 'lucide-react';
import { OrderDetails } from './order-tracking-page';
import { Badge } from '../ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

interface TrackingSearchProps {
  recentOrders: OrderDetails[];
  onTrackOrder: (orderId: string) => OrderDetails | null;
  onSelectOrder: (order: OrderDetails) => void;
}

export function TrackingSearch({
  recentOrders,
  onTrackOrder,
  onSelectOrder,
}: TrackingSearchProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (!trackingInput.trim()) {
      setError('Please enter an order ID or tracking number.');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const order = onTrackOrder(trackingInput);
      if (order) {
        onSelectOrder(order);
      } else {
        setError(
          'Order not found. Please check the number and try again.'
        );
      }
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out-for-delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="tracking-number"
                placeholder="Enter your tracking number..."
                value={trackingInput}
                onChange={(e) => {
                  setTrackingInput(e.target.value);
                  if (error) setError(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-11 text-base sm:text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full sm:w-auto h-11"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
              ) : (
                'Track'
              )}
            </Button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-destructive mt-2 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Or select a recent order</h2>
        <div className="space-y-3">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onSelectOrder(order)}
                className="w-full text-left"
              >
                <Card className="hover:bg-accent transition-colors hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex w-12 h-12 bg-muted rounded-lg items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.courierName} &bull; {order.trackingNumber}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace('-', ' ')}
                    </Badge>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
