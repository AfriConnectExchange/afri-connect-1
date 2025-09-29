'use client';
import { useState, useEffect } from 'react';
import {
  PlusCircle,
  MoreHorizontal,
  Search,
  ListFilter,
  Package,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Star,
  Flame,
  Pencil,
  BarChart2,
  Megaphone,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

function ListingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
      <Card className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Skeleton className="h-5 w-full" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-3/4" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-1/2" />
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Skeleton className="h-5 w-1/2" />
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Skeleton className="h-5 w-1/2" />
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-16 w-16 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-3/4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-5 w-1/2" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-5 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function SellerDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/adverts/list');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        const errorData = await res.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.error || 'Failed to fetch your products.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Could not connect to the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProducts();
  }, []);

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
    setProducts(products.filter((p) => p.id !== productId));
    toast({ title: 'Success', description: 'Product deleted successfully.' });
  };

  const handleFormSave = async (productData: Partial<Product>) => {
    const isEditing = !!selectedProduct;
    const endpoint = isEditing ? '/api/adverts/edit' : '/api/adverts/create';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      toast({
        title: 'Success',
        description: `Product ${
          isEditing ? 'updated' : 'created'
        } successfully.`,
      });

      setIsFormOpen(false);
      fetchUserProducts(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending_approval':
        return 'secondary';
      case 'sold':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const Sidebar = () => (
    <div className="hidden lg:block w-64 border-r bg-muted/40 p-4">
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Marketplace
        </Button>
        <h2 className="text-2xl font-bold mb-4">Selling</h2>
        <Button onClick={handleCreateNew} className="w-full mb-6">
            <PlusCircle className="mr-2 h-4 w-4" /> Create new listing
        </Button>
        <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
                <BarChart2 className="w-4 h-4 mr-2" /> Seller dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" /> Your listings
            </Button>
             <Button variant="ghost" className="w-full justify-start">
                <Megaphone className="w-4 h-4 mr-2" /> Announcements
            </Button>
             <Button variant="ghost" className="w-full justify-start">
                <BarChart2 className="w-4 h-4 mr-2" /> Insights
            </Button>
             <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" /> Marketplace profile
            </Button>
        </nav>
    </div>
  );

  return (
    <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground">Chats to answer</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Star className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold">0 <span className="text-base font-normal">/ 5</span></p>
                            <p className="text-sm text-muted-foreground">Seller rating</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Listings</CardTitle>
                        <CardDescription>Manage your active and pending listings.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><Flame className="w-4 h-4 mr-2" />Boost listings</Button>
                        <Button onClick={handleCreateNew}><Pencil className="w-4 h-4 mr-2" />Create new listing</Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Needs attention</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</p>
                        <p className="text-sm text-muted-foreground">Active & pending</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{products.filter(p => p.status === 'sold').length}</p>
                        <p className="text-sm text-muted-foreground">Sold & out of stock</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Drafts</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">To renew</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">To delete & relist</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Marketplace Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Analytics will be displayed here.</p>
                </CardContent>
            </Card>
        </main>
        <ListingForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleFormSave}
            product={selectedProduct}
        />
    </div>
  );
}
