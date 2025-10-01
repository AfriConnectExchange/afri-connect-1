
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import type { Product } from '@/app/marketplace/page';
import { useRouter } from 'next/navigation';

export function HeaderSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({ q: query, limit: '5' });
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.products || []);
      }
      setIsLoading(false);
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
    }
  };
  
  const handleSuggestionClick = (product: Product) => {
    router.push(`/product/${product.id}`);
    setIsFocused(false);
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Input
            placeholder="Search products, brands and categories"
            className="pl-4 pr-10 h-10 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button
          className="h-10 rounded-l-none"
          onClick={handleSearch}
        >
          <Search className="w-5 h-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {isFocused && (query.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-20 shadow-lg">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-1">
                {suggestions.map((product) => (
                  <li
                    key={product.id}
                    className="p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <Image src={product.image} alt={product.name} width={48} height={48} className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <p className="font-semibold text-sm">£{product.price.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No suggestions found for "{query}".
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
