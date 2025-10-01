'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TrackingSearch } from './tracking-search';
import { TrackingDetails } from './tracking-details';
import { AnimatePresence, motion } from 'framer-motion';
import type { OrderDetails } from './types';
import { useRouter } from 'next/navigation';


export function OrderTrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');

  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(
    null
  );

  const handleTrackOrder = async (orderId: string): Promise<OrderDetails | null> => {
    try {
      const response = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId)}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to track order:", error);
      return null;
    }
  };

  const handleSelectOrder = (order: OrderDetails) => {
    setSelectedOrder(order);
  };

  const handleClear = () => {
    setSelectedOrder(null);
    router.push('/tracking');
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
       <AnimatePresence mode="wait">
        {selectedOrder ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TrackingDetails order={selectedOrder} onClear={handleClear} onNavigate={router.push} />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
             <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-bold">Track Your Order</h1>
              <p className="text-muted-foreground">
                Enter your order ID or tracking number for real-time updates.
              </p>
            </div>
            <TrackingSearch
              onTrackOrder={handleTrackOrder}
              onSelectOrder={handleSelectOrder}
              initialOrderId={orderIdFromUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
