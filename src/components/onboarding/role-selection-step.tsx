'use client';

import { useState } from 'react';
import { Briefcase, ShoppingBag, School, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedButton } from '../ui/animated-button';

interface RoleSelectionStepProps {
  onNext: (data: { role: string }) => void;
  onBack: () => void;
  onUpdate: (data: { role: string }) => void;
  currentValue: string;
}

const roles = [
  { id: '1', name: 'Buyer', description: 'Browse, buy, and trade for items.', icon: ShoppingBag },
  { id: '2', name: 'Seller', description: 'List products and sell to a wide audience.', icon: Briefcase },
  { id: '3', name: 'SME', description: 'Grow your Small or Medium Enterprise with our tools.', icon: Lightbulb },
  { id: '4', name: 'Trainer', description: 'Offer courses and share your expertise.', icon: School, comingSoon: true },
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
        <p className="text-muted-foreground mb-8">This helps us tailor your experience. You can add more roles later.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => (
            <div
                key={role.id}
                onClick={() => !role.comingSoon && handleSelectRole(role.id)}
                className={cn(
                'p-6 rounded-lg border-2 text-left relative',
                role.comingSoon ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                selectedRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
            >
                {role.comingSoon && <span className="absolute top-2 right-2 text-xs font-semibold bg-muted px-2 py-1 rounded-full">Coming Soon</span>}
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
            <AnimatedButton onClick={() => onNext({ role: selectedRole })} disabled={!selectedRole || roles.find(r => r.id === selectedRole)?.comingSoon}>Next</AnimatedButton>
        </div>
        </div>
    );
}