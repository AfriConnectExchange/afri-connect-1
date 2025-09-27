// @/components/ProductPage.tsx
'use client';
import React from 'react';

interface ProductPageProps {
    productId: number;
    onNavigate: (page: string) => void;
    onAddToCart: (product: any) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId, onNavigate, onAddToCart }) => {
    const product = { id: productId, name: `Product ${productId}` };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p>Product details...</p>
            <button onClick={() => onAddToCart(product)} className="text-green-500">Add to Cart</button>
            <button onClick={() => onNavigate('marketplace')} className="text-blue-500 ml-4">Back to Marketplace</button>
        </div>
    );
};
