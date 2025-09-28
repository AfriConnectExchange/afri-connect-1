'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, Loader2 } from 'lucide-react';
import { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const listingFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(0, 'Price must be a positive number.')
  ),
  category_id: z.string().min(1, 'Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1, 'Quantity must be at least 1.')
  ),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

interface ListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: Product | null;
}

export function ListingForm({ isOpen, onClose, onSave, product }: ListingFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const cats = await res.json();
        setCategories(cats.filter((c: any) => c.id !== 'all'));
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category_id: '',
      listing_type: 'sale',
      location_text: '',
      quantity: 1,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title,
        description: product.description,
        price: product.price,
        category_id: String(product.category_id),
        listing_type: product.listing_type,
        location_text: product.location_text,
        quantity: (product as any).stockCount || 1,
      });
      setImages(product.images);
    } else {
      form.reset();
      setImages([]);
    }
  }, [product, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (images.length + files.length > 4) {
      toast({ variant: 'destructive', title: 'Upload Error', description: 'You can upload a maximum of 4 images.' });
      return;
    }
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls]);
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  const onSubmit = async (data: ListingFormValues) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newProductData = {
        ...product, // preserve id if editing
        id: product?.id || `prod_${Date.now()}`,
        ...data,
        images,
        status: product?.status || 'active',
        name: data.title,
        seller: 'Current User',
        sellerVerified: true,
        category: categories.find(c => c.id === data.category_id)?.name || 'Uncategorized',
        rating: product?.rating || 0,
        reviews: product?.reviews || 0,
    }
    onSave(newProductData);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Listing' : 'Create New Listing'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to list your product on the marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-6 pl-1 -mr-6 -ml-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Handcrafted Leather Bag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your product in detail..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <div>
                <FormLabel>Product Images (up to 4)</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {images.map((url, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image src={url} alt={`upload-preview-${index}`} layout="fill" className="rounded-md object-cover" />
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     {images.length < 4 && (
                        <label htmlFor="image-upload" className="cursor-pointer aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="mt-2 text-sm text-muted-foreground">Upload</span>
                            <input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="listing_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="barter">For Barter</SelectItem>
                           <SelectItem value="freebie">Freebie/Giveaway</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Available</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
             <FormField
              control={form.control}
              name="location_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., London, UK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-1 -mx-6 px-6">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSaving}>
                    Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {product ? 'Save Changes' : 'Create Listing'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}