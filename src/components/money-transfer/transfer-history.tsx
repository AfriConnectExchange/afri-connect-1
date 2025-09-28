'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Transfer {
  id: string;
  recipient: string;
  amountSent: number;
  recipientCountry: string;
  status: 'delivered' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
}

const mockTransfers: Transfer[] = [
  { id: 'AC-REM-001', recipient: 'John Doe', amountSent: 250, recipientCountry: 'Nigeria', status: 'delivered', date: '2025-09-20T14:30:00Z', paymentMethod: 'Credit Card' },
  { id: 'AC-REM-002', recipient: 'Sarah Johnson', amountSent: 150, recipientCountry: 'Kenya', status: 'pending', date: '2025-09-19T10:00:00Z', paymentMethod: 'Digital Wallet' },
  { id: 'AC-REM-003', recipient: 'Michael Brown', amountSent: 500, recipientCountry: 'Ghana', status: 'failed', date: '2025-09-18T16:45:00Z', paymentMethod: 'Credit Card' }
];

const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' }
];

interface TransferHistoryProps {
  onSelectTransfer: (transfer: Transfer) => void;
}

export function TransferHistory({ onSelectTransfer }: TransferHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTransfers = mockTransfers.filter(transfer => {
    const matchesSearch = transfer.recipient.toLowerCase().includes(searchQuery.toLowerCase()) || transfer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'delivered': return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'pending': return { Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'failed': return { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default: return { Icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-card">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredTransfers.map(transfer => {
          const { Icon, color, bg } = getStatusProps(transfer.status);
          const country = countries.find(c => c.name === transfer.recipientCountry);
          return (
            <motion.div
              key={transfer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectTransfer(transfer)}
              className="cursor-pointer"
            >
              <div className="bg-card p-4 rounded-lg border border-transparent hover:border-primary/40 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{transfer.recipient}</h3>
                      <p className="text-sm text-muted-foreground">
                        {country?.flag} To {transfer.recipientCountry} • {transfer.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      £{transfer.amountSent.toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium capitalize ${color}`}>{transfer.status}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
