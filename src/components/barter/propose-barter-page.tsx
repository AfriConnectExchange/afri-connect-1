
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';
import { BarterProposalForm, type BarterFormData } from '../checkout/payments/BarterProposalForm';
import { PageLoader } from '../ui/loader';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export function ProposeBarterPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const { toast } = useToast();
    const supabase = createClient();

    const [targetProduct, setTargetProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`*, seller:profiles(full_name)`)
                .eq('id', productId)
                .single();
            
            if (error || !data) {
                toast({ variant: 'destructive', title: 'Error', description: 'Product not found.' });
            } else {
                setTargetProduct({
                    ...data,
                    name: data.title,
                    image: data.images?.[0] || '',
                    seller: data.seller?.full_name || 'Unknown',
                } as Product);
            }
            setIsLoading(false);
        };
        fetchProduct();
    }, [productId, supabase, toast]);

    const handleBarterConfirm = async (proposalData: BarterFormData) => {
        if (!targetProduct) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to propose a barter.");
            
            // This is a simplified search for the user's item. 
            // In a real scenario, this would be a selection from the user's listed items.
            const { data: userProducts, error: userProductsError } = await supabase
                .from('products')
                .select('id')
                .eq('seller_id', user.id)
                .limit(1);
                
            if (userProductsError || userProducts.length === 0) {
                throw new Error("You must have at least one active listing to propose a barter.");
            }

            const payload = {
                recipient_product_id: targetProduct.id,
                proposer_product_id: userProducts[0].id, // Using first product for demo
                notes: `Offering: ${proposalData.itemName}. Est. Value: £${proposalData.estimatedValue}. ${proposalData.additionalNotes}`
            };

            const response = await fetch('/api/barter/propose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to send proposal.");

            toast({
                title: 'Proposal Sent!',
                description: 'Your barter proposal has been sent to the seller.',
            });
        } catch(error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }
    
    if (!targetProduct) {
        return (
             <div className="text-center">
                <h2 className="text-xl font-semibold">Product Not Found</h2>
                <p className="text-muted-foreground">The product you're trying to barter for could not be found.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/marketplace">Back to Marketplace</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href={`/product/${productId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Product
            </Link>
            <BarterProposalForm 
                targetProduct={{
                  id: targetProduct.id,
                  name: targetProduct.name,
                  seller: targetProduct.seller,
                  estimatedValue: targetProduct.price,
                }}
                onConfirm={handleBarterConfirm}
                onCancel={() => {}}
            />
        </div>
    );
}

