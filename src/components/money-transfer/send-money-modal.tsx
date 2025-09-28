'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CreditCard, Wallet, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string, message: string) => void;
}

export function SendMoneyModal({ isOpen, onClose, onSuccess }: SendMoneyModalProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [sendAmount] = useState('100.00'); // Mock data, pass as prop in real app
  const [receiveAmount] = useState('180052.00'); // Mock data
  const [selectedCountry] = useState({ currency: 'NGN' }); // Mock data

  const handleFinalSend = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onClose();
    onSuccess('Transfer Successful!', `Your transfer of £${parseFloat(sendAmount).toFixed(2)} to ${recipientDetails.name} has been initiated.`);
    // Reset state
    setStep(1);
    setRecipientDetails({ name: '', phone: '' });
    setPaymentMethod('card');
  };
  
  const isSendDetailsValid = recipientDetails.name.length > 2 && recipientDetails.phone.length > 5;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="font-semibold text-lg">Recipient Details</h3>
            <div className="space-y-2">
              <Label htmlFor="rec-name">Recipient's Full Name</Label>
              <Input id="rec-name" placeholder="e.g. John Doe" value={recipientDetails.name} onChange={e => setRecipientDetails({ ...recipientDetails, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-phone">Recipient's Phone Number</Label>
              <Input id="rec-phone" placeholder="+234 800 000 0000" value={recipientDetails.phone} onChange={e => setRecipientDetails({ ...recipientDetails, phone: e.target.value })} />
            </div>
            <Button className="w-full mt-4" onClick={() => setStep(2)} disabled={!isSendDetailsValid}>Next</Button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Method</h3>
            <div className="space-y-3">
              <div onClick={() => setPaymentMethod('card')} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted'}`}>
                <CreditCard className="w-6 h-6 text-primary" />
                <div><p className="font-medium">Debit/Credit Card</p><p className="text-sm text-muted-foreground">Standard processing fees apply</p></div>
              </div>
              <div onClick={() => setPaymentMethod('wallet')} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted'}`}>
                <Wallet className="w-6 h-6 text-primary" />
                <div><p className="font-medium">Digital Wallet</p><p className="text-sm text-muted-foreground">Lower fees, faster processing</p></div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="w-full" onClick={() => setStep(3)}>Next</Button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="font-semibold text-lg">Review & Confirm</h3>
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">You are sending</span><span className="font-medium text-foreground">£{parseFloat(sendAmount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Recipient</span><span className="font-medium text-foreground">{recipientDetails.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">They receive approx.</span><span className="font-medium text-foreground">{parseFloat(receiveAmount).toLocaleString('en-US', { style: 'currency', currency: selectedCountry.currency })}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-foreground">Total to be charged</span><span className="font-bold text-primary">£{(parseFloat(sendAmount)).toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isProcessing}>Back</Button>
              <Button className="w-full gap-2" onClick={handleFinalSend} disabled={isProcessing}>
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? "Processing..." : "Confirm & Send"}
              </Button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Transfer</DialogTitle>
          <DialogDescription>Step {step} of 3</DialogDescription>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
