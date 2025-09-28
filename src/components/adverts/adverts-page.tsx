'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, Search, ListFilter, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ListingForm } from './listing-form';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';
import Image from 'next/image';
import { PageLoader } from '../ui/loader';
import { Input } from '../ui/input';

export function AdvertsPageComponent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProducts = async () => {
      setIsLoading(true);
      // In a real app, this would fetch only the user's products
      // Simulating an empty list for now to show the empty state
      // const res = await fetch('/api/adverts/list');
      // if (res.ok) {
      //   setProducts(await res.json());
      // } else {
      //   toast({
      //     variant: 'destructive',
      //     title: 'Error',
      //     description: 'Failed to fetch your products.',
      //   });
      // }
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts([]); // Start with an empty array
      setIsLoading(false);
    };

    fetchUserProducts();
  }, [toast]);

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId: string) => {
    console.log('Deleting product:', productId);
    setProducts(products.filter(p => p.id !== productId));
    toast({ title: 'Success', description: 'Product deleted successfully.' });
  }

  const handleFormSave = (productData: Partial<Product>) => {
    // This function creates a more complete product object for the UI
    const createFullProduct = (data: Partial<Product>): Product => {
        const categoryName = 'Uncategorized'; // Placeholder
        const newProduct: Product = {
            id: data.id || `prod_${Date.now()}`,
            seller_id: 'current_user',
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            currency: 'GBP',
            category_id: data.category_id || 0,
            listing_type: data.listing_type || 'sale',
            status: data.status || 'active',
            images: data.images || ['https://placehold.co/400x300'],
            location_text: data.location_text || '',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: data.title || '',
            image: data.images?.[0] || 'https://placehold.co/400x300',
            seller: 'Current User',
            sellerVerified: true,
            category: categoryName,
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            stockCount: data.quantity_available || 1,
            quantity_available: data.quantity_available || 1,
        };
        return newProduct;
    };
    
    const newProduct = createFullProduct(productData);

    if (selectedProduct) {
        setProducts(products.map((p) => (p.id === newProduct.id ? newProduct : p)));
        toast({ title: 'Success', description: 'Product updated successfully.' });
    } else {
        setProducts([newProduct, ...products]);
        toast({ title: 'Success', description: 'Product created successfully.' });
    }
    setIsFormOpen(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'sold': return 'outline';
      default: return 'destructive';
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product listings and view their status.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Listing
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <PageLoader />
        </div>
      ) : products.length > 0 ? (
        <>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search listings..." className="pl-10" />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                    <ListFilter className="h-4 w-4" />
                </Button>
            </div>
            <Card className="sm:hidden">
                 <CardContent className="p-0">
                    <div className="divide-y">
                        {products.map(product => (
                             <div key={product.id} className="p-4 flex gap-4">
                                <Image
                                    alt={product.name}
                                    className="aspect-square rounded-md object-cover self-start"
                                    height="80"
                                    src={product.image}
                                    width="80"
                                />
                                <div className="flex-1 space-y-1">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">£{product.price.toFixed(2)}</p>
                                    <Badge variant={getStatusVariant(product.status)} className="capitalize">{product.status.replace('_', ' ')}</Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleEdit(product)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleDelete(product.id)} className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                        ))}
                    </div>
                 </CardContent>
            </Card>
            <Card className="hidden sm:block">
            <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="hidden md:table-cell">Inventory</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                        <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.image}
                            width="64"
                        />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                        <Badge variant={getStatusVariant(product.status)} className="capitalize">
                            {product.status.replace('_', ' ')}
                        </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">£{product.price.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">{product.stockCount || 1} in stock</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEdit(product)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDelete(product.id)} className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </>
      ) : (
         <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No listings yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Click the button below to create your first product listing and start selling.
              </p>
              <Button onClick={handleCreateNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Listing
              </Button>
            </CardContent>
        </Card>
      )}
      
      <ListingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleFormSave}
        product={selectedProduct}
      />
    </div>
  );
}
