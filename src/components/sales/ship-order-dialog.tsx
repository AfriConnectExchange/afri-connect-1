
'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Sale } from './sales-page';

interface ShipOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Sale;
  onConfirm: (orderId: string, courierName: string, trackingNumber: string) => Promise<void>;
}

export function ShipOrderDialog({ isOpen, onClose, order, onConfirm }: ShipOrderDialogProps) {
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!courierName || !trackingNumber) {
      // Basic validation
      return;
    }
    setIsSubmitting(true);
    await onConfirm(order.id, courierName, trackingNumber);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ship Order</DialogTitle>
          <DialogDescription>
            Enter the shipping details for order #{order.id.substring(0, 8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courier-name">Courier Name</Label>
            <Input
              id="courier-name"
              placeholder="e.g., Royal Mail, DPD"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-number">Tracking Number</Label>
            <Input
              id="tracking-number"
              placeholder="Enter the tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !courierName || !trackingNumber}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
