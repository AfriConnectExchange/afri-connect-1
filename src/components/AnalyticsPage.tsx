// @/components/AnalyticsPage.tsx
'use client';
import React from 'react';

interface AnalyticsPageProps {
    onNavigate: (page: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Analytics</h1>
            <p>View your analytics here.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
