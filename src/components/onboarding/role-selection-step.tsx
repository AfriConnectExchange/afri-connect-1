'use client';

import { useState } from 'react';
import { Briefcase, ShoppingBag, School, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedButton } from '../ui/animated-button';

interface RoleSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: { role: string }) => void;
  currentValue: string;
}

const roles = [
  { id: '1', name: 'Buyer', description: 'Find and purchase products.', icon: ShoppingBag },
  { id: '2', name: 'Seller', description: 'Sell your products on our marketplace.', icon: Briefcase },
  { id: '3', name: 'SME', description: 'Grow your small or medium enterprise.', icon: Lightbulb },
  { id: '4', name: 'Trainer', description: 'Offer training and expertise to others.', icon: School },
];

export function RoleSelectionStep({ onNext, onBack, onUpdate, currentValue }: RoleSelectionStepProps) {
    const [selectedRole, setSelectedRole] = useState(currentValue);

    const handleSelectRole = (roleId: string) => {
        setSelectedRole(roleId);
        onUpdate({ role: roleId });
    }

    return (
        <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Primary Role</h2>
        <p className="text-muted-foreground mb-8">What brings you to AfriConnect Exchange? You can change this later.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => (
            <div
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={cn(
                'p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 text-left',
                selectedRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
            >
                <div className="flex items-center gap-4">
                    <role.icon className={cn("w-8 h-8", selectedRole === role.id ? 'text-primary' : 'text-muted-foreground')} />
                    <div>
                        <h3 className="font-semibold text-lg">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                </div>
            </div>
            ))}
        </div>

        <div className="flex justify-between items-center">
            <AnimatedButton variant="outline" onClick={onBack}>Back</AnimatedButton>
            <AnimatedButton onClick={onNext} disabled={!selectedRole}>Next</AnimatedButton>
        </div>
        </div>
    );
}
