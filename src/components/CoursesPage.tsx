// @/components/CoursesPage.tsx
'use client';
import React from 'react';

interface CoursesPageProps {
    onNavigate: (page: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Courses</h1>
            <p>Browse our courses.</p>
            <button onClick={() => onNavigate('/')} className="text-blue-500">Back to Home</button>
        </div>
    );
};
