
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
  courier_name: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    seller: {
      name: string;
      id: string;
    };
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    phone: string;
    name: string;
  };
  events: TrackingEvent[];
  payment: {
    method: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
  },
  created_at: string;
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
