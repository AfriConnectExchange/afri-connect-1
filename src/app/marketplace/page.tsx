'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FilterPanel } from '@/components/marketplace/FilterPanel';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';

export interface Product {
  id: string; // Changed to string for UUID
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: number;
  listing_type: 'sale' | 'barter' | 'freebie';
  status: 'active' | 'sold' | 'delisted';
  images: string[]; // Assuming images are an array of URLs
  location_text: string; 
  created_at: string;
  updated_at: string;
  quantity_available: number;
  specifications?: any;
  shipping_policy?: any;
  
  // Properties from old interface, to be mapped or joined
  name: string; // Will map from title
  originalPrice?: number;
  rating: number; // Will need a join or separate fetch
  reviews: number; // Will need a join or separate fetch
  seller: string; // Will need a join to profiles table
  sellerVerified: boolean; // Will need a join to profiles table
  image: string; // Will use the first image from the images array
  category: string; // Will need a join to categories table
  featured?: boolean;
  discount?: number;
  isFree?: boolean;
  stockCount: number;
  sellerDetails: any; // Add this to hold the full seller profile
}

export interface Category {
  id: string;
  name: string;
  count: number;
}


export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  priceRange: { min: number | null; max: number | null };
  verifiedSellersOnly: boolean;
  featuredOnly: boolean;
  onSaleOnly: boolean;
  freeShippingOnly: boolean;
  freeListingsOnly: boolean;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, addToCart, cartCount } = useCart();
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchError, setSearchError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    priceRange: { min: null, max: null },
    verifiedSellersOnly: false,
    featuredOnly: false,
    onSaleOnly: false,
    freeShippingOnly: false,
    freeListingsOnly: false,
  });

  const fetchProducts = useCallback(async (currentFilters: FilterState, currentSortBy: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.searchQuery.length >= 3) {
        params.append('q', currentFilters.searchQuery);
      }
      if (currentFilters.selectedCategories.length > 0 && !currentFilters.selectedCategories.includes('all')) {
        params.append('category', currentFilters.selectedCategories.join(','));
      }
      if (currentFilters.priceRange.min !== null) {
        params.append('minPrice', String(currentFilters.priceRange.min));
      }
      if (currentFilters.priceRange.max !== null) {
        params.append('maxPrice', String(currentFilters.priceRange.max));
      }
      if (currentFilters.freeListingsOnly) {
        params.append('isFree', 'true');
      }
      if (currentFilters.verifiedSellersOnly) {
        params.append('verified', 'true');
      }
      params.append('sortBy', currentSortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      setProducts(data.products);
      setTotalProducts(data.total);

    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Error fetching products',
          description: (error as Error).message,
        });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching categories',
          description: (error as Error).message,
        });
      }
    };
    
    fetchCategories();
    fetchProducts(filters, sortBy);
  }, [fetchProducts, filters, sortBy, toast]);


  const onNavigate = (page: string, productId?: string) => {
    if (page === 'product' && productId) {
      router.push(`/product/${productId}`);
    } else {
        router.push(`/${page}`);
    }
  };

  const onAddToCart = (product: Product) => {
    addToCart(product);
  };

  // Handle search with validation (US014)
  const handleSearch = (query: string) => {
    setSearchError('');
    if (query.length > 0 && query.length < 3) {
      setSearchError('Please enter at least 3 letters or numbers.');
      return;
    }
    const alphanumericCount = query.replace(/[^a-zA-Z0-9]/g, '').length;
    if (query.length > 0 && alphanumericCount < 3) {
      setSearchError('Please enter at least 3 letters or numbers.');
      return;
    }
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategories: [],
      priceRange: { min: null, max: null },
      verifiedSellersOnly: false,
      featuredOnly: false,
      onSaleOnly: false,
      freeShippingOnly: false,
      freeListingsOnly: false,
    });
    setSearchError('');
  };

  const getNoResultsMessage = () => {
    if (filters.searchQuery.length >= 3) {
      return 'No products found. Try a different keyword.'; // US014-AC02
    }
    if (filters.selectedCategories.length > 0) {
      return 'No products found in this category.'; // US015-AC02
    }
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      return 'No products found in this price range.'; // US016-AC03
    }
    if (filters.freeListingsOnly) {
      return 'No free products found.'; // US017-AC02
    }
    return 'No products match your current filters.';
  };
  
  return (
    <>
    <Header cartCount={cartCount} />
    <div className="container mx-auto px-0 sm:px-4 py-6 md:py-8 relative">
      {/* Page Header */}
      <div className="mb-6 md:mb-8 px-4 sm:px-0">
        <h1 className="mb-1 text-2xl md:text-3xl font-bold tracking-tight">
          Marketplace
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Discover authentic products from sellers in the UK
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <FilterPanel
              categories={categories}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearAllFilters={handleClearAllFilters}
              currency="£"
              isLoading={!categories || categories.length === 0}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Mobile Search and Filters */}
          <div className="lg:hidden px-4 mb-4 flex gap-2">
            <SearchBar
              value={filters.searchQuery}
              onChange={(value) => handleSearch(value)}
              onSearch={() => fetchProducts(filters, sortBy)}
              placeholder="Search..."
              className="flex-grow"
            />
             <Sheet
              open={mobileFiltersOpen}
              onOpenChange={setMobileFiltersOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="w-full rounded-t-2xl max-h-[85vh] flex flex-col p-0"
              >
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <FilterPanel
                    categories={categories}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearAllFilters={handleClearAllFilters}
                    currency="£"
                    isLoading={!categories || categories.length === 0}
                  />
                </div>
                <div className="p-4 border-t bg-background">
                  <Button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full"
                  >
                    View {products.length} Results
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
            {searchError && (
              <p className="text-xs text-destructive mt-1 px-4 lg:px-0">{searchError}</p>
            )}


          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 px-4 sm:px-0">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">
                Showing {products.length} of {totalProducts} products
                {filters.searchQuery && ` for "${filters.searchQuery}"`}
              </p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="px-4 sm:px-0">
            <ProductGrid
              products={products}
              loading={loading}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
              currency="£"
              searchQuery={filters.searchQuery}
              noResultsMessage={getNoResultsMessage()}
              hasMore={false}
            />
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
