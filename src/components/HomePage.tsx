// @/components/HomePage.tsx
'use client';
import React from 'react';

interface HomePageProps {
    onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to AfriConnect</h1>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onNavigate('marketplace')} className="p-4 bg-gray-200 rounded">Marketplace</button>
                <button onClick={() => onNavigate('courses')} className="p-4 bg-gray-200 rounded">Courses</button>
                <button onClick={() => onNavigate('adverts')} className="p-4 bg-gray-200 rounded">Adverts</button>
                <button onClick={() => onNavigate('remittance')} className="p-4 bg-gray-200 rounded">Remittance</button>
            </div>
        </div>
    );
};
