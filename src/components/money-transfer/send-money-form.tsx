'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockRates = { "NGN": 1800.52, "KES": 168.33, "GHS": 15.41, "ZAR": 22.87 };

function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number> | null>(mockRates);
  return { rates };
}

const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' }
];

const MIN_SEND_AMOUNT = 5.00;
const FEE_PERCENTAGE = 0.015;

interface SendMoneyFormProps {
  onContinue: () => void;
}

export function SendMoneyForm({ onContinue }: SendMoneyFormProps) {
  const { rates } = useExchangeRates();
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [fee, setFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const amount = parseFloat(sendAmount);
    setError(null);
    if (!amount || isNaN(amount) || !rates || !selectedCountry) {
      setReceiveAmount(0);
      setFee(0);
      setExchangeRate(0);
      return;
    }
    if (amount > 0 && amount < MIN_SEND_AMOUNT) {
      setError(`Minimum transfer amount is £${MIN_SEND_AMOUNT.toFixed(2)}`);
      setReceiveAmount(0);
      setFee(0);
      setExchangeRate(0);
      return;
    }
    const rate = rates[selectedCountry.currency] || 0;
    const calculatedFee = amount * FEE_PERCENTAGE;
    const amountToConvert = amount - calculatedFee;
    setExchangeRate(rate);
    setFee(calculatedFee);
    setReceiveAmount(amountToConvert * rate);
  }, [sendAmount, selectedCountry, rates]);
  
  const isButtonDisabled = !!error || !sendAmount || parseFloat(sendAmount) < MIN_SEND_AMOUNT;

  return (
    <Card className="border-border/60 rounded-2xl shadow-lg">
      <CardContent className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="space-y-3">
              <Label className="text-muted-foreground">You send</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-4xl font-bold h-auto p-0 border-0 focus-visible:ring-0 bg-transparent"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-0 bg-muted font-medium text-foreground px-4 py-2 rounded-lg">
                  GBP
                </div>
              </div>
            </div>
            <div className="my-6 flex justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <Label className="text-muted-foreground">Recipient gets</Label>
              <div className="relative">
                <p className="text-4xl font-bold text-primary truncate pr-28">
                  {receiveAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <Select
                  onValueChange={(code) =>
                    setSelectedCountry(countries.find((c) => c.code === code)!)
                  }
                  defaultValue={selectedCountry.code}
                >
                  <SelectTrigger className="absolute top-1/2 -translate-y-1/2 right-0 w-auto bg-muted font-medium text-foreground rounded-lg h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-0">
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-destructive text-sm font-medium mb-4"
              >
                {error}
              </motion.p>
            )}
            <div className="space-y-4 text-sm text-foreground p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <p>Exchange rate:</p>
                <p className="font-medium">
                  1 GBP ≈ {(exchangeRate || 0).toFixed(2)}{' '}
                  {selectedCountry.currency}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p>Fee ({(FEE_PERCENTAGE * 100).toFixed(2)}%):</p>
                <p className="font-medium">£{fee.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center font-semibold mt-4 pt-4 border-t">
                <p>Total to pay:</p>
                <p>£{(parseFloat(sendAmount) || 0).toFixed(2)}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full mt-6"
              disabled={isButtonDisabled}
              onClick={onContinue}
            >
              Continue Transaction
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
