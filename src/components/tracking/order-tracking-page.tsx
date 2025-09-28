'use client';

import { useState } from 'react';
import { TrackingSearch } from './tracking-search';
import { TrackingDetails } from './tracking-details';
import { AnimatePresence, motion } from 'framer-motion';

// Mock Data - In a real app, this would come from an API
const mockOrders = [
  {
    id: 'ORD-2024-001',
    trackingNumber: 'TRK1234567890UK',
    status: 'out-for-delivery',
    courierName: 'Royal Mail',
    courierLogo: '/placeholder.svg',
    estimatedDelivery: '2024-08-25T16:00:00Z',
    items: [
      {
        id: 1,
        name: 'Traditional Kente Cloth',
        image:
          'https://images.unsplash.com/photo-1692689383138-c2df3476072c?w=100',
        quantity: 1,
        price: 125,
      },
    ],
    shippingAddress: {
      name: 'John Smith',
      street: '123 Example Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '+44 7700 900123',
    },
    events: [
      {
        id: '6',
        status: 'Out for Delivery',
        description: 'Package is with the courier for delivery today.',
        location: 'London Delivery Hub',
        timestamp: '2024-08-25T09:30:00Z',
        isCompleted: true,
        isCurrent: true,
      },
      {
        id: '5',
        status: 'In Transit',
        description: 'Package has arrived in the destination country.',
        location: 'Heathrow Airport, London',
        timestamp: '2024-08-23T16:20:00Z',
        isCompleted: true,
      },
      {
        id: '4',
        status: 'Shipped',
        description: 'Package has been dispatched from origin.',
        location: 'Accra International Airport',
        timestamp: '2024-08-22T08:15:00Z',
        isCompleted: true,
      },
      {
        id: '3',
        status: 'Processing',
        description: 'Item has been picked and packed at the warehouse.',
        location: 'Accra, Ghana',
        timestamp: '2024-08-21T14:45:00Z',
        isCompleted: true,
      },
      {
        id: '2',
        status: 'Order Confirmed',
        description: 'Payment has been confirmed.',
        location: 'Online',
        timestamp: '2024-08-20T10:31:00Z',
        isCompleted: true,
      },
      {
        id: '1',
        status: 'Order Placed',
        description: 'Your order has been received.',
        location: 'Online',
        timestamp: '2024-08-20T10:30:00Z',
        isCompleted: true,
      },
    ],
    courierContact: {
      phone: '+44 345 774 0740',
      website: 'https://www.royalmail.com',
    },
  },
  {
    id: 'ORD-2024-002',
    trackingNumber: 'DHL9876543210UK',
    status: 'delivered',
    courierName: 'DHL Express',
    courierLogo: '/placeholder.svg',
    estimatedDelivery: '2024-08-20T14:00:00Z',
    actualDelivery: '2024-08-20T13:45:00Z',
    items: [
      {
        id: 2,
        name: 'African Print Dress',
        image:
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=100',
        quantity: 2,
        price: 42,
      },
    ],
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '456 High Street',
      city: 'Manchester',
      postcode: 'M1 1AA',
      phone: '+44 7700 900456',
    },
    events: [
      {
        id: '3',
        status: 'Delivered',
        description: 'Package delivered and signed for.',
        location: 'Manchester, M1 1AA',
        timestamp: '2024-08-20T13:45:00Z',
        isCompleted: true,
        isCurrent: true,
      },
      {
        id: '2',
        status: 'Shipped',
        description: 'Package dispatched from origin.',
        location: 'Nairobi, Kenya',
        timestamp: '2024-08-19T10:00:00Z',
        isCompleted: true,
      },
      {
        id: '1',
        status: 'Order Placed',
        description: 'Order received and being processed.',
        location: 'Online',
        timestamp: '2024-08-18T11:20:00Z',
        isCompleted: true,
      },
    ],
    courierContact: {
      phone: '+44 345 100 0800',
      website: 'https://www.dhl.co.uk',
    },
  },
];

export interface OrderDetails {
  id: string;
  trackingNumber: string;
  status:
    | 'processing'
    | 'shipped'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'failed';
  courierName: string;
  courierLogo: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: Array<{
    id: number;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postcode: string;
    phone: string;
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

  const handleTrackOrder = (orderId: string) => {
    const order = mockOrders.find(
      (o) =>
        o.trackingNumber.toLowerCase() === orderId.toLowerCase() ||
        o.id.toLowerCase() === orderId.toLowerCase()
    );
    return order || null;
  };

  const handleSelectOrder = (order: OrderDetails) => {
    setSelectedOrder(order);
  };

  const handleClear = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
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
              recentOrders={mockOrders}
              onTrackOrder={handleTrackOrder}
              onSelectOrder={handleSelectOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
