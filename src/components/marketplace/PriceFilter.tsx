'use client';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface PriceFilterProps {
  value: PriceRange;
  onChange: (value: PriceRange) => void;
  onClearFilter: () => void;
  currency?: string;
}

export function PriceFilter({
  value,
  onChange,
  onClearFilter,
  currency = '£',
}: PriceFilterProps) {
  const [minPrice, setMinPrice] = useState(value.min?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(value.max?.toString() ?? '');

  useEffect(() => {
    setMinPrice(value.min?.toString() ?? '');
    setMaxPrice(value.max?.toString() ?? '');
  }, [value]);

  const handleApply = () => {
    const min = minPrice ? parseInt(minPrice, 10) : null;
    const max = maxPrice ? parseInt(maxPrice, 10) : null;
    onChange({ min, max });
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    onClearFilter();
  };

  const hasActiveFilter = value.min !== null || value.max !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Price Range</Label>
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Price
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {currency}
          </span>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="pl-7 text-sm"
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {currency}
          </span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="pl-7 text-sm"
          />
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleApply}
        className="w-full h-8"
      >
        Apply
      </Button>
    </div>
  );
}
