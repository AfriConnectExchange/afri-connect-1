// @/components/CartPage.tsx
'use client';
import React from 'react';

interface CartPageProps {
    cartItems: any[];
    onNavigate: (page: string) => void;
    onUpdateCart: (items: any[]) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ cartItems, onNavigate, onUpdateCart }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cartItems.map(item => (
                        <li key={item.id} className="mb-2">
                            {item.name} - {item.quantity}
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
