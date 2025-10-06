'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface ProfileAction {
    label: string;
    href: string;
    isDestructive?: boolean;
}

interface ProfileCardProps {
    title: string;
    icon: React.ReactNode;
    actions: ProfileAction[];
}

export function ProfileCard({ title, icon, actions }: ProfileCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                {icon}
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
                <div className="divide-y">
                    {actions.map((action) => (
                        <Link key={action.label} href={action.href} passHref>
                            <div
                                className={cn(
                                    'flex items-center justify-between p-4 cursor-pointer hover:bg-accent transition-colors',
                                    action.isDestructive ? 'text-destructive hover:bg-destructive/10' : ''
                                )}
                            >
                                <span>{action.label}</span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
