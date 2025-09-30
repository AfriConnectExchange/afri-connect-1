'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, MessageSquare, Ship, Truck } from 'lucide-react';
import type { Product } from '@/app/marketplace/page';
import { ReviewsSection, type Review } from './reviews-section';

interface ProductInfoTabsProps {
  product: Product;
  reviews: Review[];
}

export function ProductInfoTabs({ product, reviews }: ProductInfoTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="bg-transparent p-0 h-auto justify-start border-b rounded-none gap-4">
        <TabsTrigger value="details" className="text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
          <Info className="w-4 h-4" />
          Product Details
        </TabsTrigger>
        <TabsTrigger value="reviews" className="text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
          <MessageSquare className="w-4 h-4" />
          Reviews ({reviews.length})
        </TabsTrigger>
        {product.shipping_policy && (
          <TabsTrigger value="shipping" className="text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-2 pb-2 gap-2">
            <Ship className="w-4 h-4" />
            Shipping Info
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 pt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="space-y-3 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium text-foreground/80 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground text-right">{String(value)}</span>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No specifications provided for this product.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews" className="space-y-4 pt-6">
        <ReviewsSection reviews={reviews} />
      </TabsContent>
      
      {product.shipping_policy && (
        <TabsContent value="shipping" className="space-y-4 pt-6">
           <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50">
                    <Truck className="w-5 h-5 text-primary mt-1" />
                    <div>
                    <h4 className="font-medium">Domestic Shipping</h4>
                    <p className="text-sm text-muted-foreground">{product.shipping_policy.domestic}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50">
                    <Ship className="w-5 h-5 text-primary mt-1" />
                    <div>
                    <h4 className="font-medium">International Shipping</h4>
                    <p className="text-sm text-muted-foreground">{product.shipping_policy.international}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
