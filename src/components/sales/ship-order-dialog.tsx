
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Sale } from './sales-page';
import { Alert, AlertDescription } from '../ui/alert';

interface ShipOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Sale;
  onConfirm: (orderId: string, courierName: string, trackingNumber: string) => Promise<void>;
}

const supportedCouriers = [
    { id: 'royal-mail', name: 'Royal Mail' },
    { id: 'dpd', name: 'DPD' },
    { id: 'evri', name: 'Evri (Hermes)' },
    { id: 'dhl', name: 'DHL' },
    { id: 'gig-logistics', name: 'GIG Logistics' },
];


export function ShipOrderDialog({ isOpen, onClose, order, onConfirm }: ShipOrderDialogProps) {
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!courierName || !trackingNumber) {
      setError('Please select a courier and enter a tracking number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
        await onConfirm(order.id, courierName, trackingNumber);
        onClose();
    } catch(err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    // Reset state on close
    setCourierName('');
    setTrackingNumber('');
    setError('');
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ship Order</DialogTitle>
          <DialogDescription>
            Enter shipping details for order #{order.id.substring(0, 8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courier-name">Courier *</Label>
            <Select onValueChange={setCourierName} value={courierName}>
                <SelectTrigger id="courier-name">
                    <SelectValue placeholder="Select a courier" />
                </SelectTrigger>
                <SelectContent>
                    {supportedCouriers.map(courier => (
                        <SelectItem key={courier.id} value={courier.name}>{courier.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-number">Tracking Number *</Label>
            <Input
              id="tracking-number"
              placeholder="Enter the tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
