// @/components/RemittancePage.tsx
'use client';
import React from 'react';

interface RemittancePageProps {
    onNavigate: (page: string) => void;
}

export const RemittancePage: React.FC<RemittancePageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Remittance</h1>
            <p>Send and receive money.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
