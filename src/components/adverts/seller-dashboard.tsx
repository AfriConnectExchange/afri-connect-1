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
  Trash2,
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
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/app/marketplace/page';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '../ui/confirmation-modal';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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
    router.push('/adverts/create');
  };

  const handleEdit = (product: Product) => {
    router.push(`/adverts/edit/${product.id}`);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
        const response = await fetch('/api/adverts/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: showDeleteConfirm.id }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete product.');
        }

        toast({ title: 'Success', description: 'Product deleted successfully.' });
        fetchUserProducts(); // Refresh the list from the server
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setShowDeleteConfirm(null);
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
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => router.push('/marketplace')}>
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
             <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/sales')}>
                <Package className="w-4 h-4 mr-2" /> My Sales
            </Button>
             <Button variant="ghost" className="w-full justify-start">
                <BarChart2 className="w-4 h-4 mr-2" /> Insights
            </Button>
             <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/profile')}>
                <User className="w-4 h-4 mr-2" /> Marketplace profile
            </Button>
        </nav>
    </div>
  );

  return (
    <>
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
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Your Listings</CardTitle>
                        <CardDescription>Manage your active and pending listings.</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search listings..." className="pl-10"/>
                        </div>
                        <Button variant="outline" size="icon"><ListFilter className="w-4 h-4" /></Button>
                         <Button onClick={handleCreateNew} className="hidden sm:flex">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                      <ListingsSkeleton />
                    ) : products.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Price</TableHead>
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
                                            alt="Product image"
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.image}
                                            width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(product.status)} className="capitalize">{product.status}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">£{product.price.toFixed(2)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stockCount}</TableCell>
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
                                                <DropdownMenuItem>Boost Listing</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onSelect={() => setShowDeleteConfirm(product)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ) : (
                         <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">You have no listings yet.</p>
                             <Button onClick={handleCreateNew} className="mt-4">
                                <PlusCircle className="mr-2 h-4 w-4" /> Create First Listing
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    </div>
    
    {showDeleteConfirm && (
        <ConfirmationModal
            isOpen={!!showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(null)}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            description={`Are you sure you want to delete the listing "${showDeleteConfirm.name}"? This action cannot be undone.`}
            confirmText="Delete"
            type="destructive"
        />
    )}
    </>
  );
}
