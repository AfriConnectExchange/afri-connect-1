'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { ProductActions } from './product-actions';
import type { Product } from '@/app/marketplace/page';

function ProductsSkeleton() {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(6)].map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-10 w-10 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-8" />
              </TableCell>
               <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/adverts/list');
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [toast]);
  
  const handleDelete = async (productId: string) => {
    // Optimistically remove the product from the UI
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    
    try {
        const response = await fetch('/api/adverts/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete product.');
        }
        toast({ title: "Product Deleted", description: "The product has been successfully removed." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Deletion Failed", description: (error as Error).message });
        // If the API call fails, re-fetch the products to revert the UI
        fetchProducts();
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'sold':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product listings and inventory.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      {isLoading ? (
        <ProductsSkeleton />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
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
                        alt={product.title}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.images?.[0] || '/placeholder.svg'}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(product.status)} className="capitalize">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>£{product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.quantity_available}
                    </TableCell>
                    <TableCell>
                      <ProductActions productId={product.id} onDelete={() => handleDelete(product.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
