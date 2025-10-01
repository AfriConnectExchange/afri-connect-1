'use client';

import { useState } from 'react';
import { TrackingSearch } from './tracking-search';
import { TrackingDetails } from './tracking-details';
import { AnimatePresence, motion } from 'framer-motion';

export interface OrderDetails {
  id: string;
  tracking_number: string;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'cancelled'
    | 'failed';
  courierName: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    phone: string;
    name: string;
  };
  events: TrackingEvent[];
  courierContact?: {
    phone: string;
    website: string;
  };
}
export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export function OrderTrackingPage() {
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
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <p className="text-muted-foreground">
          Enter your order ID or tracking number for real-time updates.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {selectedOrder ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TrackingDetails order={selectedOrder} onClear={handleClear} />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TrackingSearch
              onTrackOrder={handleTrackOrder}
              onSelectOrder={handleSelectOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
