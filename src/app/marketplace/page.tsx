'use client';
import { useState, useEffect, useMemo } from 'react';
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
import type { CartItem } from '@/components/cart/cart-page';
import { useFirebase } from '@/firebase';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  seller: string;
  sellerVerified: boolean;
  image: string;
  category: string;
  featured?: boolean;
  discount?: number;
  isFree?: boolean;
  isGifterListing?: boolean;
  location?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair';
  shippingType?: 'free' | 'paid' | 'pickup-only';
  estimatedDelivery?: string;
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
  const { user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchError, setSearchError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // In a real app, you'd fetch the cart from a global state or API
    // For now, we just calculate the count from local state
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  }, [cart]);


  const onNavigate = (page: string, productId?: number) => {
    if (page === 'product' && productId) {
      router.push(`/product/${productId}`);
    } else {
      router.push(`/${page}`);
    }
  };

  const onAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, inStock: true, shippingCost: 5.99 }]; // Add default values
      }
    });
  };

  const categories = [
    { id: 'all', name: 'All Categories', count: 1250 },
    { id: 'clothing', name: 'Clothing & Fashion', count: 320 },
    { id: 'crafts', name: 'Arts & Crafts', count: 280 },
    { id: 'beauty', name: 'Beauty & Wellness', count: 150 },
    { id: 'electronics', name: 'Electronics', count: 95 },
    { id: 'home', name: 'Home & Decor', count: 210 },
    { id: 'food', name: 'Food & Beverages', count: 185 },
  ];

  // Sample products with GBP pricing and free listings
  const allProducts: Product[] = [
    {
      id: 1,
      name: 'Traditional Kente Cloth - Authentic Ghanaian Design',
      price: 125,
      originalPrice: 145,
      rating: 4.8,
      reviews: 124,
      seller: 'Accra Crafts',
      sellerVerified: true,
      image:
        'https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'clothing',
      featured: true,
      discount: 14,
      location: 'Ghana',
      condition: 'new',
      shippingType: 'paid',
      estimatedDelivery: '7-10 business days',
    },
    {
      id: 2,
      name: 'Handcrafted Wooden Sculpture - Elephant Design',
      price: 78,
      rating: 4.9,
      reviews: 89,
      seller: 'Lagos Artisans',
      sellerVerified: true,
      image:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnRzfGVufDF8fHx8MTc1ODEyMTQ4MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'crafts',
      location: 'Nigeria',
      condition: 'new',
      shippingType: 'free',
      estimatedDelivery: '5-7 business days',
    },
    {
      id: 3,
      name: 'African Print Dress - Ankara Style',
      price: 42,
      rating: 4.7,
      reviews: 156,
      seller: 'Ankara Fashion',
      sellerVerified: true,
      image:
        'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZmFzaGlvbnxlbnwxfHx8fDE3NTgxMjE0ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'clothing',
      location: 'Kenya',
      condition: 'new',
      shippingType: 'paid',
      estimatedDelivery: '4-6 business days',
    },
    {
      id: 4,
      name: 'Organic Shea Butter - Raw & Unprocessed',
      price: 0,
      rating: 4.6,
      reviews: 203,
      seller: 'Natural Beauty Co',
      sellerVerified: false,
      image:
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGVhJTIwYnV0dGVyfGVufDF8fHx8MTc1ODEyMTQ5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'beauty',
      isFree: true,
      isGifterListing: true,
      location: 'Ghana',
      condition: 'new',
      shippingType: 'pickup-only',
    },
    {
      id: 5,
      name: 'Beaded Jewelry Set - Traditional African Design',
      price: 35,
      rating: 4.5,
      reviews: 67,
      seller: 'Beads & Beyond',
      sellerVerified: true,
      image:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5fGVufDF8fHx8MTc1ODEyMTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'crafts',
      location: 'South Africa',
      condition: 'new',
      shippingType: 'free',
      estimatedDelivery: '3-5 business days',
    },
    {
      id: 6,
      name: 'Woven Basket - Multi-Purpose Storage',
      price: 0,
      rating: 4.4,
      reviews: 45,
      seller: 'Basket Weavers Co',
      sellerVerified: true,
      image:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXR8ZW58MXx8fHwxNzU4MTIxNTAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'home',
      isFree: true,
      isGifterListing: true,
      location: 'Rwanda',
      condition: 'like-new',
      shippingType: 'paid',
    },
    {
      id: 7,
      name: 'Vintage African Print Fabric Collection',
      price: 0,
      rating: 4.8,
      reviews: 32,
      seller: 'Heritage Textiles',
      sellerVerified: true,
      image:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWJyaWN8ZW58MXx8fHwxNzU4MTIxNTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'crafts',
      isFree: true,
      isGifterListing: true,
      location: 'Mali',
      condition: 'good',
      shippingType: 'pickup-only',
    },
  ];

  // Filter state
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

  // Handle search with validation (US014)
  const handleSearch = (query: string) => {
    setLoading(true);
    setSearchError('');

    // US014-AC03 - Search validation
    if (query.length > 0 && query.length < 3) {
      setSearchError('Please enter at least 3 letters or numbers.');
      setLoading(false);
      return;
    }

    const alphanumericCount = query.replace(/[^a-zA-Z0-9]/g, '').length;
    if (query.length > 0 && alphanumericCount < 3) {
      setSearchError('Please enter at least 3 letters or numbers.');
      setLoading(false);
      return;
    }

    // Simulate search delay
    setTimeout(() => {
      handleFiltersChange({ searchQuery: query });
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  };

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Search filter (US014)
    if (filters.searchQuery.length >= 3) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.seller.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Category filter (US015)
    if (
      filters.selectedCategories.length > 0 &&
      !filters.selectedCategories.includes('all')
    ) {
      filtered = filtered.filter((product) =>
        filters.selectedCategories.includes(product.category)
      );
    }

    // Price filter (US016)
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      filtered = filtered.filter((product) => {
        const { min, max } = filters.priceRange;
        if (product.isFree) return min === null || min === 0;
        if (min !== null && product.price < min) return false;
        if (max !== null && product.price > max) return false;
        return true;
      });
    }

    // Free listings filter (US017)
    if (filters.freeListingsOnly) {
      filtered = filtered.filter((product) => product.isFree);
    }

    // Other filters
    if (filters.verifiedSellersOnly) {
      filtered = filtered.filter((product) => product.sellerVerified);
    }

    if (filters.featuredOnly) {
      filtered = filtered.filter((product) => product.featured);
    }

    if (filters.onSaleOnly) {
      filtered = filtered.filter(
        (product) => product.discount && product.discount > 0
      );
    }

    if (filters.freeShippingOnly) {
      filtered = filtered.filter(
        (product) => product.shippingType === 'free'
      );
    }

    return filtered;
  }, [filters, allProducts]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          return a.price - b.price;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          if (a.isFree && !b.isFree) return 1;
          if (!a.isFree && b.isFree) return -1;
          return b.price - a.price;
        });
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      default: // relevance
        return sorted.sort((a, b) => {
          // Featured items first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then by rating
          return b.rating - a.rating;
        });
    }
  }, [filteredProducts, sortBy]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  // Generate no results message based on context
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
    <Header cartCount={cartCount}/>
    <div className="container mx-auto px-0 sm:px-4 py-6 md:py-8 relative">
      {/* Page Header */}
      <div className="mb-6 md:mb-8 px-4 sm:px-0">
        <h1 className="mb-1 text-2xl md:text-3xl font-bold tracking-tight">
          African Marketplace
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Discover authentic African products from verified sellers across the
          continent
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
              onSearch={handleSearch}
              onClearAllFilters={handleClearAllFilters}
              currency="£"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Mobile Search and Filters */}
          <div className="lg:hidden px-4 mb-4 flex gap-2">
            <SearchBar
              value={filters.searchQuery}
              onChange={(value) => handleFiltersChange({ searchQuery: value })}
              onSearch={handleSearch}
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
                    onSearch={handleSearch}
                    onClearAllFilters={handleClearAllFilters}
                    currency="£"
                  />
                </div>
                <div className="p-4 border-t bg-background">
                  <Button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full"
                  >
                    View {sortedProducts.length} Results
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
                Showing {sortedProducts.length} of {allProducts.length} products
                {filters.searchQuery && ` for "${filters.searchQuery}"`}
              </p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="px-4 sm:px-0">
            <ProductGrid
              products={sortedProducts}
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
