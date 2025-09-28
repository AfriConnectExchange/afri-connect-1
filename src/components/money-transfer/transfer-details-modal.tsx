'use client';

import { ArrowRight, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Transfer } from './transfer-history';

const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' }
];

interface TransferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: Transfer | null;
}

export function TransferDetailsModal({ isOpen, onClose, transfer }: TransferDetailsModalProps) {
  if (!transfer) return null;

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'delivered': return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'pending': return { Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'failed': return { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default: return { Icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const { Icon, color, bg } = getStatusProps(transfer.status);
  const country = countries.find(c => c.name === transfer.recipientCountry);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Receipt</DialogTitle>
          <DialogDescription>ID: {transfer.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-muted-foreground">Amount Sent</p>
            <p className="text-4xl font-bold text-foreground">£{transfer.amountSent.toFixed(2)}</p>
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bg} ${color}`}>
              <Icon className="w-4 h-4" />
              <span className="capitalize">{transfer.status}</span>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium flex items-center gap-2">🇬🇧 You</span>
            </div>
            <div className="flex justify-center my-1"><ArrowRight className="w-4 h-4 text-muted-foreground" /></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium flex items-center gap-2">{country?.flag} {transfer.recipient}</span>
            </div>
          </div>
          <div className="pt-2 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sent on</span><span className="font-medium text-foreground">{new Date(transfer.date).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Method</span><span className="font-medium text-foreground">{transfer.paymentMethod}</span></div>
          </div>
          <Button variant="outline" className="w-full gap-2"><Download className="w-4 h-4" />Download Receipt</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
