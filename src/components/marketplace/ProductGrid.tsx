'use client';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/button';
import { AlertCircle, Package } from 'lucide-react';
import type { Product } from '@/app/marketplace/page';
import { Skeleton } from '../ui/skeleton';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (product: any) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  currency?: string;
  searchQuery?: string;
  noResultsMessage?: string;
}

export function ProductGrid({
  products,
  loading = false,
  onNavigate,
  onAddToCart,
  onLoadMore,
  hasMore = false,
  currency = '£',
  searchQuery = '',
  noResultsMessage,
}: ProductGridProps) {
  const getNoResultsMessage = () => {
    if (noResultsMessage) return noResultsMessage;
    if (searchQuery.length > 0)
      return `No products found for "${searchQuery}". Try a different keyword.`;
    return 'No products found. Try adjusting your filters.';
  };

  // If loading is true AND there are no products yet, show skeletons.
  // This prevents showing skeletons when loading more products.
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-accent/50 rounded-lg">
        <div className="w-16 h-16 mb-4 rounded-full bg-background flex items-center justify-center">
          {searchQuery ? (
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Package className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? 'No products found' : 'No products available'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 px-4">
          {getNoResultsMessage()}
        </p>
        {searchQuery && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Using different keywords</li>
              <li>Checking your spelling</li>
              <li>Using more general search terms</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            onAddToCart={onAddToCart}
            animationDelay={index * 0.05}
            currency={currency}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Products'}
          </Button>
        </div>
      )}
    </div>
  );
}
