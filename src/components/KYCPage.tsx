// @/components/KYCPage.tsx
'use client';
import React from 'react';

interface KYCPageProps {
    onNavigate: (page: string) => void;
}

export const KYCPage: React.FC<KYCPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">KYC Verification</h1>
            <p>Complete your KYC verification.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
