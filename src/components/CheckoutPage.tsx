// @/components/CheckoutPage.tsx
'use client';
import React from 'react';

interface CheckoutPageProps {
    cartItems: any[];
    onNavigate: (page: string) => void;
    onUpdateCart: (items: any[]) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onNavigate, onUpdateCart }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
            <p>Complete your purchase.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
