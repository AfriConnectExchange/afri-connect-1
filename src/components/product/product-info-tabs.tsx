
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, MessageSquare, Ship, Truck } from 'lucide-react';
import type { Product } from '@/app/marketplace/page';
import { ReviewsSection } from './reviews-section';

interface ProductInfoTabsProps {
  product: Product;
}

export function ProductInfoTabs({ product }: ProductInfoTabsProps) {
  // Mock data for reviews, as the backend doesn't support it yet.
  const reviews = [
    { id: 1, user: "Amina H.", rating: 5, date: "2 weeks ago", comment: "Exceptional quality!", verified: true },
    { id: 2, user: "David O.", rating: 5, date: "1 month ago", comment: "Perfect for my wedding.", verified: true },
  ];

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="bg-transparent p-0 h-auto justify-start border-b rounded-none gap-4">
        <TabsTrigger value="details" className="text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
          <Info className="w-4 h-4" />
          Product Details
        </TabsTrigger>
        <TabsTrigger value="reviews" className="text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
          <MessageSquare className="w-4 h-4" />
          Reviews ({product.reviews})
        </TabsTrigger>
        <TabsTrigger value="shipping" className="text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
          <Ship className="w-4 h-4" />
          Shipping Info
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 pt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="font-medium text-foreground/80">{key}</span>
                  <span className="text-muted-foreground text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews" className="space-y-4 pt-6">
        <ReviewsSection reviews={reviews} />
      </TabsContent>
      
      <TabsContent value="shipping" className="space-y-4 pt-6">
         <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipping Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {product.shipping && (
                  <>
                      <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50">
                          <Truck className="w-5 h-5 text-primary mt-1" />
                          <div>
                          <h4 className="font-medium">Domestic Shipping</h4>
                          <p className="text-sm text-muted-foreground">{product.shipping.domestic}</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50">
                          <Ship className="w-5 h-5 text-primary mt-1" />
                          <div>
                          <h4 className="font-medium">International Shipping</h4>
                          <p className="text-sm text-muted-foreground">{product.shipping.international}</p>
                          </div>
                      </div>
                  </>
              )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
