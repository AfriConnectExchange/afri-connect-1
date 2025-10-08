
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Sale } from './sales-page';

const formSchema = z.object({
  courierName: z.string().min(2, 'Courier name is required.'),
  trackingNumber: z.string().min(5, 'Tracking number seems too short.'),
});

type ShipOrderFormValues = z.infer<typeof formSchema>;

interface ShipOrderModalProps {
  order: Sale;
  isOpen: boolean;
  onClose: () => void;
  onOrderShipped: () => void;
}

const couriers = [
  'Royal Mail',
  'DPD',
  'Evri (Hermes)',
  'Yodel',
  'Parcelforce',
  'DHL',
  'UPS',
  'FedEx',
];

export function ShipOrderModal({
  order,
  isOpen,
  onClose,
  onOrderShipped,
}: ShipOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ShipOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courierName: '',
      trackingNumber: '',
    },
  });

  const onSubmit = async (values: ShipOrderFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sales/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          ...values,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update order status.');
      }
      toast({
        title: 'Order Shipped!',
        description: 'The order has been marked as shipped and the buyer notified.',
      });
      onOrderShipped();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Ship Order</DialogTitle>
              <DialogDescription>
                Enter tracking details for order #{order.id.substring(0, 8)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="courierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Courier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a courier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {couriers.map((courier) => (
                          <SelectItem key={courier} value={courier}>
                            {courier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tracking number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Shipment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
