
'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BarterProposalForm } from '@/components/checkout/payments/BarterProposalForm';
import { ProductImageGallery } from './product-image-gallery';
import { ProductPurchasePanel } from './product-purchase-panel';
import { ProductInfoTabs } from './product-info-tabs';
import { SellerInfoCard } from './seller-info-card';
import { motion } from 'framer-motion';

interface ProductPageProps {
  productId: string;
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (product: any) => void;
}

export function ProductPageComponent({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBarterModalOpen, setIsBarterModalOpen] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles ( id, full_name, kyc_status, avatar_url, location, created_at ),
          category:categories ( name )
        `)
        .eq('id', productId)
        .single();

      if (error || !data) {
        toast({
          variant: 'destructive',
          title: 'Error fetching product',
          description: "This product could not be found.",
        });
        setProduct(null);
      } else {
        const mappedProduct = {
          ...data,
          name: data.title,
          image: data.images?.[0] || 'https://placehold.co/600x600',
          images: data.images?.length > 0 ? data.images : ['https://placehold.co/600x600'],
          seller: data.seller?.full_name || 'Unknown Seller',
          sellerVerified: data.seller?.kyc_status === 'verified',
          category: data.category?.name || 'Uncategorized',
          isFree: data.listing_type === 'freebie' || data.price === 0,
          rating: data.average_rating || 4.5,
          reviews: data.review_count || 0,
          sold: data.sold_count || 0,
          stockCount: data.quantity_available || 1,
          sellerDetails: {
            id: data.seller?.id,
            name: data.seller?.full_name || 'Unknown Seller',
            avatar: data.seller?.avatar_url || '',
            location: data.seller?.location || 'Unknown',
            verified: data.seller?.kyc_status === 'verified',
            rating: 4.8, // Mock - requires aggregation
            totalSales: 100, // Mock - requires aggregation
            memberSince: data.seller?.created_at ? new Date(data.seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'
          },
          // These would need dedicated tables/columns in a real app
          specifications: {
              Material: "Cotton",
              Origin: "Ghana",
              Dimensions: "6 yards"
          },
           shipping: {
              domestic: "3-5 business days",
              international: "7-14 business days"
          },
        };
        setProduct(mappedProduct as unknown as Product);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, supabase, toast]);
  
  const handleBarterConfirm = (proposalData: any) => {
    console.log("Barter Proposal submitted:", proposalData);
    toast({
        title: 'Proposal Sent!',
        description: 'Your barter proposal has been sent to the seller.',
    });
    setIsBarterModalOpen(false);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2">Loading product...</p>
      </div>
    );
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
                    onProposeBarter={() => setIsBarterModalOpen(true)}
                />
            </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <ProductInfoTabs product={product} />
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
      
      <Dialog open={isBarterModalOpen} onOpenChange={setIsBarterModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Handshake />
                Propose a Barter
            </DialogTitle>
            <DialogDescription>
              Offer one of your items or services in exchange for "{product.name}".
            </DialogDescription>
          </DialogHeader>
          <BarterProposalForm
            targetProduct={{
              id: product.id,
              name: product.name,
              seller: product.seller,
              estimatedValue: product.price,
            }}
            onConfirm={handleBarterConfirm}
            onCancel={() => setIsBarterModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
