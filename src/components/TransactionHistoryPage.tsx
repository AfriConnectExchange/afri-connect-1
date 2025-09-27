// @/components/TransactionHistoryPage.tsx
'use client';
import React from 'react';

interface TransactionHistoryPageProps {
    onNavigate: (page: string) => void;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
            <p>View your past transactions.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
