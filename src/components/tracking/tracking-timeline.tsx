'use client';

import { CheckCircle, Truck, Package, Home } from 'lucide-react';
import { TrackingEvent } from './order-tracking-page';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  const getIconForStatus = (status: string) => {
    if (status.toLowerCase().includes('delivered'))
      return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('delivery'))
      return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes('placed'))
      return <CheckCircle className="h-5 w-5" />;
    return <Package className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8 relative">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                event.isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {getIconForStatus(event.status)}
            </div>
            {index < events.length - 1 && (
              <div
                className={`w-px flex-grow ${
                  events[index + 1]?.isCompleted ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>
            )}
          </div>
          <div className="flex-1 pb-8 pt-1">
            <p
              className={`font-semibold ${
                event.isCurrent ? 'text-primary' : 'text-foreground'
              }`}
            >
              {event.status}
            </p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {event.location}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(event.timestamp).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
