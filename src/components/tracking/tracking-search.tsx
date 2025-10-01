'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertCircle } from 'lucide-react';
import type { OrderDetails } from './types';
import { AnimatePresence, motion } from 'framer-motion';

interface TrackingSearchProps {
  onTrackOrder: (orderId: string) => Promise<OrderDetails | null>;
  onSelectOrder: (order: OrderDetails) => void;
  initialOrderId?: string | null;
}

export function TrackingSearch({
  onTrackOrder,
  onSelectOrder,
  initialOrderId,
}: TrackingSearchProps) {
  const [trackingInput, setTrackingInput] = useState(initialOrderId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!trackingInput.trim()) {
      setError('Please enter an order ID or tracking number.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const order = await onTrackOrder(trackingInput);
    
    if (order) {
      onSelectOrder(order);
    } else {
      setError(
        'Order not found. Please check the number and try again.'
      );
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (initialOrderId) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

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
    </div>
  );
}
