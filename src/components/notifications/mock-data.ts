'use client';
import { Package, TrendingUp, User, AlertCircle, CheckCircle } from 'lucide-react';
import type { Notification } from './notification-item';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Confirmed',
    message:
      'Your order #AC12345 has been confirmed by the seller. Estimated delivery: 3-5 business days.',
    timestamp: new Date().toISOString(), // Today
    read: false,
    priority: 'high',
    action: {
      label: 'Track Order',
      onClick: () => console.log('Track order'),
    },
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Package Delivered',
    message:
      'Your order #AC12344 has been successfully delivered to your address. Please confirm receipt.',
    timestamp: new Date(
      new Date().setHours(new Date().getHours() - 5)
    ).toISOString(), // Today
    read: false,
    priority: 'high',
    action: {
      label: 'Confirm Receipt',
      onClick: () => console.log('Confirm receipt'),
    },
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Special Offer: 20% Off African Textiles',
    message:
      'Limited time offer on premium African fabrics and textiles. Valid until the end of the month.',
    timestamp: new Date(
      new Date().setDate(new Date().getDate() - 2)
    ).toISOString(), // This Week
    read: true,
    priority: 'medium',
    action: {
      label: 'Shop Now',
      onClick: () => console.log('Shop now'),
    },
  },
  {
    id: '4',
    type: 'order',
    title: 'Payment Required',
    message:
      'Your order #AC12346 is waiting for payment. Complete payment to proceed with shipping.',
    timestamp: new Date(
      new Date().setDate(new Date().getDate() - 4)
    ).toISOString(), // This Week
    read: true,
    priority: 'high',
    action: {
      label: 'Pay Now',
      onClick: () => console.log('Pay now'),
    },
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile Verification Complete',
    message:
      'Your seller profile has been verified. You can now list products and accept orders.',
    timestamp: new Date(
      new Date().setDate(new Date().getDate() - 10)
    ).toISOString(), // Earlier
    read: true,
    priority: 'medium',
  },
  {
    id: '6',
    type: 'delivery',
    title: 'Delivery Attempted',
    message:
      'Delivery attempt failed for order #AC12343. The package will be redelivered tomorrow.',
    timestamp: new Date(
      new Date().setDate(new Date().getDate() - 8)
    ).toISOString(), // Earlier
    read: true,
    priority: 'medium',
    action: {
      label: 'Reschedule',
      onClick: () => console.log('Reschedule delivery'),
    },
  },
];
