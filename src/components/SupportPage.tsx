// @/components/SupportPage.tsx
'use client';
import React from 'react';

interface SupportPageProps {
    onNavigate: (page: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Support</h1>
            <p>Get help and support.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
