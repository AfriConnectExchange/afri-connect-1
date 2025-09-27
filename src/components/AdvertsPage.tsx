// @/components/AdvertsPage.tsx
'use client';
import React from 'react';

interface AdvertsPageProps {
    onNavigate: (page: string) => void;
}

export const AdvertsPage: React.FC<AdvertsPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Adverts</h1>
            <p>Manage your adverts here.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
