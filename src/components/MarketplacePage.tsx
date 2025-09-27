// @/components/MarketplacePage.tsx
'use client';
import React from 'react';

interface MarketplacePageProps {
    onNavigate: (page: string, productId?: number) => void;
    onAddToCart: (product: any) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate, onAddToCart }) => {
    const products = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
            <div className="grid grid-cols-3 gap-4">
                {products.map(p => (
                    <div key={p.id} className="border p-4">
                        <h2 className="font-bold">{p.name}</h2>
                        <button onClick={() => onNavigate('product', p.id)} className="text-blue-500">View</button>
                        <button onClick={() => onAddToCart(p)} className="ml-2 text-green-500">Add to Cart</button>
                    </div>
                ))}
            </div>
            <button onClick={() => onNavigate('/')} className="text-blue-500 mt-4">Back to Home</button>
        </div>
    );
};
