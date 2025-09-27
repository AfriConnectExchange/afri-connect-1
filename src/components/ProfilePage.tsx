// @/components/ProfilePage.tsx
'use client';
import React from 'react';

interface ProfilePageProps {
    onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">My Profile</h1>
            <p>Edit your profile details here.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
