'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SendMoneyForm } from './send-money-form';
import { TransferHistory } from './transfer-history';
import type { Transfer } from './transfer-history';
import { SendMoneyModal } from './send-money-modal';
import { TransferDetailsModal } from './transfer-details-modal';
import { useToast } from '@/hooks/use-toast';

interface MoneyTransferPageProps {
  onNavigate: (page: string) => void;
}

export function MoneyTransferPage({ onNavigate }: MoneyTransferPageProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [modalView, setModalView] = useState<'send' | 'details' | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const { toast } = useToast();

  const handleOpenSendModal = () => setModalView('send');
  
  const handleOpenDetailsModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setModalView('details');
  };
  
  const closeModal = () => {
    setModalView(null);
    setSelectedTransfer(null);
  };
  
  const showSuccessToast = (title: string, message: string) => {
    toast({
      title: title,
      description: message,
    });
  };

  return (
    <>
      <div className="border-b border-border bg-card sticky top-[69px] z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Money Transfer
              </h1>
              <p className="text-muted-foreground">
                Send money securely across Africa
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('send')}
              size="sm"
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">Send Money</span>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'send' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('send')}
              className="w-32"
            >
              Send Money
            </Button>
            <Button
              variant={activeTab === 'history' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className="w-32"
            >
              History
            </Button>
          </div>
        </div>

        {activeTab === 'send' && (
          <motion.div
            key="send-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SendMoneyForm onContinue={handleOpenSendModal} />
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TransferHistory onSelectTransfer={handleOpenDetailsModal} />
          </motion.div>
        )}
      </div>

      <SendMoneyModal
        isOpen={modalView === 'send'}
        onClose={closeModal}
        onSuccess={showSuccessToast}
      />
      
      <TransferDetailsModal
        isOpen={modalView === 'details'}
        onClose={closeModal}
        transfer={selectedTransfer}
      />
    </>
  );
}
