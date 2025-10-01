
'use client';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ListingForm } from '@/components/adverts/listing-form';
import { createClient } from '@/lib/supabase/client';
import { PageLoader } from '@/components/ui/loader';
import { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';
import { Package, TrendingUp, User as UserIcon } from 'lucide-react';

export default function EditListingPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();
  
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (error || !data) {
        toast({ variant: 'destructive', title: 'Error', description: 'Product not found.' });
      } else {
        // Here you would map the fetched data to your Product interface.
        // This is a simplified mapping.
        const mappedProduct: Product = {
            ...data,
            name: data.title,
            image: data.images?.[0] || '',
            stockCount: data.quantity_available,
            seller: '',
            sellerVerified: false,
            category: '',
            rating: 4.5,
            reviews: 0,
        };
        setProduct(mappedProduct);
      }
      setLoading(false);
    };

    if (params.id) {
        fetchProduct();
    }
  }, [params.id, supabase, toast]);

  if (loading) {
    return <PageLoader />;
  }
  
  const navItems = [
    { id: 'adverts', label: 'My Listings', href: '/adverts', icon: Package },
    { id: 'sales', label: 'My Sales', href: '/sales', icon: TrendingUp },
    { id: 'profile', label: 'Marketplace Profile', href: '/profile', icon: UserIcon },
  ];
  
  return (
    <>
      <DashboardHeader title="Edit Listing" navItems={navItems} />
      <ListingForm product={product} />
    </>
  );
}
