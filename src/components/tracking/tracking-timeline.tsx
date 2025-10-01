'use client';
import { TrackingEvent } from './types';
import { cn } from '@/lib/utils';
import { CheckCircle, Truck, Package, Home } from 'lucide-react';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  const getIconForStatus = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return <Home className="h-5 w-5" />;
    if (lowerStatus.includes('shipped') || lowerStatus.includes('delivery')) return <Truck className="h-5 w-5" />;
    if (lowerStatus.includes('placed') || lowerStatus.includes('confirmed')) return <CheckCircle className="h-5 w-5" />;
    return <Package className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                event.isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {getIconForStatus(event.status)}
            </div>
            {index < events.length - 1 && (
              <div
                className={cn(
                  'w-px flex-grow',
                   events[index + 1]?.isCompleted ? 'bg-primary' : 'bg-border'
                )}
              ></div>
            )}
          </div>
          <div className="flex-1 pb-8 pt-1">
            <p className={cn('font-semibold', event.isCurrent ? 'text-primary' : 'text-foreground')}>
              {event.status}
            </p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(event.timestamp).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {' at '}
              {event.location}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
