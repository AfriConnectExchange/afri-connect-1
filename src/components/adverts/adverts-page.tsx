'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, AlertCircle, Search, ListFilter, LayoutGrid, Grid } from 'lucide-react';
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
import { Product } from '@/app/marketplace/page';
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
      const res = await fetch('/api/products'); 
      if (res.ok) {
        const allProducts = await res.json();
        // For demo, we'll just take a few products as if they are the user's
        setProducts(allProducts.slice(0, 5));
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch your products.',
        });
      }
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
    // Implement delete logic
     console.log('Deleting product:', productId);
     toast({ title: 'Success', description: 'Product deleted successfully.' });
  }

  const handleFormSave = (product: Product) => {
    if (selectedProduct) {
      // Update logic
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
      toast({ title: 'Success', description: 'Product updated successfully.' });
    } else {
      // Create logic
      setProducts([product, ...products]);
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

       <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search listings..." className="pl-10" />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
                <ListFilter className="h-4 w-4" />
            </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <PageLoader />
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-lg font-medium">No listings yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Create New Listing" to get started.
              </p>
              <Button onClick={handleCreateNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Listing
              </Button>
            </div>
          ) : (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Inventory
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
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
                      <Badge variant={getStatusVariant(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      £{product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {(product as any).stockCount || 1} in stock
                    </TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEdit(product)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDelete(product.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <ListingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleFormSave}
        product={selectedProduct}
      />
    </div>
  );
}