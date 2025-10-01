'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';
import { ProductImageGallery } from './product-image-gallery';
import { ProductPurchasePanel } from './product-purchase-panel';
import { ProductInfoTabs } from './product-info-tabs';
import { SellerInfoCard } from './seller-info-card';
import { motion } from 'framer-motion';
import { Review } from './reviews-section';
import { Skeleton } from '../ui/skeleton';

interface ProductPageProps {
  productId: string;
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (product: any) => void;
}

function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-4 md:py-6">
            <Skeleton className="h-6 w-48 mb-4 md:mb-6" />
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-6 md:mb-8">
                <div className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="grid grid-cols-4 gap-2">
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Skeleton className="aspect-square w-full rounded-md" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
             <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="h-64 w-full" />
                </div>
                 <div className="lg:sticky top-24 self-start">
                    <Skeleton className="h-48 w-full" />
                 </div>
             </div>
        </div>
    )
}

export function ProductPageComponent({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchProductAndReviews = async () => {
    if (!productId) return;
    setLoading(true);
    
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        seller:profiles ( id, full_name, kyc_status, avatar_url, location, created_at ),
        category:categories ( name )
      `)
      .eq('id', productId)
      .single();

    if (productError || !productData) {
      toast({
        variant: 'destructive',
        title: 'Error fetching product',
        description: "This product could not be found.",
      });
      setProduct(null);
    } else {
      const mappedProduct = {
        ...productData,
        name: productData.title,
        image: productData.images?.[0] || 'https://placehold.co/600x600',
        images: productData.images?.length > 0 ? productData.images : ['https://placehold.co/600x600'],
        seller: productData.seller?.full_name || 'Unknown Seller',
        sellerVerified: productData.seller?.kyc_status === 'verified',
        category: productData.category?.name || 'Uncategorized',
        isFree: productData.listing_type === 'freebie' || productData.price === 0,
        rating: productData.average_rating || 0,
        reviews: productData.review_count || 0,
        stockCount: productData.quantity_available || 1,
        sellerDetails: {
          id: productData.seller?.id,
          name: productData.seller?.full_name || 'Unknown Seller',
          avatar: productData.seller?.avatar_url || '',
          location: productData.seller?.location || 'Unknown',
          verified: productData.seller?.kyc_status === 'verified',
          rating: 4.8, // This is still mock data
          totalSales: 100, // This is still mock data
          memberSince: productData.seller?.created_at ? new Date(productData.seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'
        },
        specifications: productData.specifications,
        shipping_policy: productData.shipping_policy
      };
      setProduct(mappedProduct as unknown as Product);

      const res = await fetch(`/api/reviews/product?productId=${productId}`);
      if(res.ok) {
          const reviewData = await res.json();
          setReviews(reviewData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [productId, supabase, toast]);
  

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Button onClick={() => onNavigate('marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-4 md:py-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('marketplace')}
          className="p-0 h-auto font-normal text-xs sm:text-sm text-muted-foreground mb-4 md:mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Marketplace
        </Button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-6 md:mb-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <ProductImageGallery images={product.images} productName={product.name} />
            </motion.div>
            
            <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.5, delay: 0.1 }}
            >
                <ProductPurchasePanel
                    product={product}
                    onAddToCart={onAddToCart}
                />
            </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <ProductInfoTabs product={product} reviews={reviews} onReviewSubmit={fetchProductAndReviews} />
          </div>

          <div className="lg:sticky top-24 self-start">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
             >
                <SellerInfoCard sellerDetails={product.sellerDetails} />
             </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
