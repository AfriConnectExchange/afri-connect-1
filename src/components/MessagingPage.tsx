// @/components/MessagingPage.tsx
'use client';
import React from 'react';

interface MessagingPageProps {
    onNavigate: (page: string) => void;
}

export const MessagingPage: React.FC<MessagingPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Messages</h1>
            <p>Your messages will appear here.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
