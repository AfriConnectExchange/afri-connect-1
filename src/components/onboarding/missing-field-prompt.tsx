"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  field: 'email' | 'phone';
  defaultValue?: string;
  onSave: (value: string) => Promise<void>;
  onCancel?: () => void;
}

export function MissingFieldPrompt({ field, defaultValue = '', onSave, onCancel }: Props) {
  const [value, setValue] = React.useState(defaultValue);
  const [loading, setLoading] = React.useState(false);

  const placeholder = field === 'email' ? 'you@example.com' : '+447700900123';

  return (
    <div className="p-4 border rounded-lg bg-card">
      <p className="mb-2">We didn't receive your {field} from your provider. Please provide it to continue.</p>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
        <Button onClick={async () => { setLoading(true); await onSave(value); setLoading(false); }} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default MissingFieldPrompt;
