// @/components/NotificationsPage.tsx
'use client';
import React from 'react';

interface NotificationsPageProps {
    onNavigate: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Notifications</h1>
            <p>You have no new notifications.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
