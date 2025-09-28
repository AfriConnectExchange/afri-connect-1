'use client';
import { Gift, Heart } from 'lucide-react';
import { Badge } from '../ui/badge';

interface FreeListingBadgeProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function FreeListingBadge({
  variant = 'default',
  className = '',
}: FreeListingBadgeProps) {
  if (variant === 'compact') {
    return (
      <Badge
        className={`bg-green-100 text-green-800 hover:bg-green-200 border border-green-200 ${className}`}
      >
        <Gift className="w-3 h-3 mr-1" />
        Free
      </Badge>
    );
  }

  return (
    <Badge
      className={`bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 ${className}`}
    >
      <Gift className="w-3 h-3 mr-1" />
      Free Gift
    </Badge>
  );
}

interface GifterBadgeProps {
  className?: string;
}

export function GifterBadge({ className = '' }: GifterBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`bg-purple-100 text-purple-800 border border-purple-200 ${className}`}
    >
      <Heart className="w-3 h-3 mr-1 fill-current" />
      Gifter
    </Badge>
  );
}

interface ReceiverBadgeProps {
  className?: string;
}

export function ReceiverBadge({ className = '' }: ReceiverBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`bg-blue-100 text-blue-800 border border-blue-200 ${className}`}
    >
      <Gift className="w-3 h-3 mr-1" />
      Receiver
    </Badge>
  );
}
