'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Shield, Truck, RotateCcw, MessageCircle, Plus, Minus, Info, Ship, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';

interface ProductPageProps {
  productId: string;
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: (product: any) => void;
}

export function ProductPageComponent({ productId, onNavigate, onAddToCart }: ProductPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
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
          seller:profiles ( full_name, kyc_status, avatar_url, location ),
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
          // Mocking these for now
          rating: 4.5,
          reviews: 10,
          sold: 25,
          stockCount: 50,
          specifications: {
              Material: "Cotton",
              Origin: "Ghana",
              Dimensions: "6 yards"
          },
          shipping: {
              domestic: "3-5 business days",
              international: "7-14 business days"
          },
          sellerDetails: { // Renaming for clarity
            name: data.seller?.full_name || 'Unknown Seller',
            avatar: data.seller?.avatar_url || '',
            location: data.seller?.location || 'Unknown',
            verified: data.seller?.kyc_status === 'verified',
            rating: 4.8,
            totalSales: 100,
            memberSince: 'Jan 2023'
          }
        };
        setProduct(mappedProduct as unknown as Product);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, supabase, toast]);


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
  
  const formatPrice = (price: number) => `£${price.toLocaleString()}`;

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
     toast({
        title: "Added to cart!",
        description: `${product.name} (x${quantity}) has been added to your cart.`,
    })
  };
  
    // Mock reviews for display until API is connected
  const reviews = [
    { id: 1, user: "Amina H.", rating: 5, date: "2 weeks ago", comment: "Exceptional quality!", verified: true },
    { id: 2, user: "David O.", rating: 5, date: "1 month ago", comment: "Perfect for my wedding.", verified: true },
  ];

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6 text-sm text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('marketplace')}
          className="p-0 h-auto font-normal text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Marketplace
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-6 md:mb-8">
        <motion.div 
          className="space-y-3 md:space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div className="aspect-square overflow-hidden rounded-2xl shadow-lg bg-muted">
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
              {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
                }`}>
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="space-y-4 md:space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.featured && <Badge className="bg-primary text-[10px] sm:text-xs">Featured</Badge>}
              {product.discount && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs">-{product.discount}%</Badge>
              )}
            </div>
            <h1 className="mb-2 text-xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-xs sm:text-sm">{product.rating}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">({product.reviews} reviews)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground text-xs sm:text-sm">{product.sold} sold</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl md:text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base md:text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span id="quantity" className="px-3 text-center font-medium text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  disabled={quantity >= product.stockCount}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {product.stockCount} pieces available
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button size="lg" className="w-full h-11 sm:h-12" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="w-full h-11 sm:h-12">
                  Buy Now
                </Button>
              </div>
              <div className="flex items-center justify-end gap-1">
                 <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 sm:w-auto">
                   <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                 </Button>
                 <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 sm:w-auto">
                   <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                 </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-4 border-t border-b">
            <div className="text-center">
              <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-[10px] sm:text-xs font-medium">Secure Payment</div>
              <div className="text-[10px] text-muted-foreground">Escrow Protection</div>
            </div>
            <div className="text-center">
              <Truck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-[10px] sm:text-xs font-medium">Fast Shipping</div>
              <div className="text-[10px] text-muted-foreground">3-5 Days</div>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <div className="text-[10px] sm:text-xs font-medium">Easy Returns</div>
              <div className="text-[10px] text-muted-foreground">7 Day Return</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-transparent p-0 h-auto justify-start border-b rounded-none gap-4">
              <TabsTrigger value="details" className="text-xs sm:text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
                <Info className="w-4 h-4" />
                Product Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs sm:text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
                <MessageSquare className="w-4 h-4" />
                Reviews ({product.reviews})
              </TabsTrigger>
              <TabsTrigger value="shipping" className="text-xs sm:text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
                <Ship className="w-4 h-4" />
                Shipping Info
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Specifications</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0 text-xs sm:text-sm">
                        <span className="font-medium text-foreground/80">{key}</span>
                        <span className="text-muted-foreground text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4 pt-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 mb-2">
                          <span className="font-medium text-sm sm:text-base">{review.user}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-[10px] w-fit">Verified Purchase</Badge>
                          )}
                          <span className="text-xs sm:text-sm text-muted-foreground sm:ml-auto">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="shipping" className="space-y-4 pt-4">
               <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Shipping Options</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50">
                    <Truck className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Domestic Shipping</h4>
                      <p className="text-muted-foreground">{product.shipping.domestic}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50">
                    <Ship className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">International Shipping</h4>
                      <p className="text-muted-foreground">{product.shipping.international}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="sticky top-24"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={(product as any).sellerDetails.avatar} />
                    <AvatarFallback>{(product as any).sellerDetails.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{(product as any).sellerDetails.name}</span>
                      {(product as any).sellerDetails.verified && (
                        <Badge variant="secondary" className="text-[10px]">Verified</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{(product as any).sellerDetails.location}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{(product as any).sellerDetails.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sales</span>
                    <span>{(product as any).sellerDetails.totalSales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Joined</span>
                    <span>{(product as any).sellerDetails.memberSince}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full text-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

    