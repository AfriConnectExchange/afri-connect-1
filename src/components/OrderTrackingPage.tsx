// @/components/OrderTrackingPage.tsx
'use client';
import React from 'react';

interface OrderTrackingPageProps {
    onNavigate: (page: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
            <p>Enter your order ID to track.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
