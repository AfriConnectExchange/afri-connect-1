'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2, Save, Undo, Smartphone } from 'lucide-react';
import type { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle } from '../ui/alert';

const listingFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.preprocess(
    (a) => parseFloat(String(a) || '0'),
    z.number().min(0, 'Price must be a positive number.')
  ),
  category_id: z.coerce.number().int().positive('Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity_available: z.preprocess(
    (a) => parseInt(String(a) || '1', 10),
    z.number().int().min(1, 'Quantity must be at least 1.')
  ),
  images: z.array(z.string()).optional(),
  // Dynamic Fields
  condition: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  model_number: z.string().optional(),
  storage_capacity: z.string().optional(),
  service_delivery: z.string().optional(),
  availability: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

interface ListingFormPageProps {
  product?: Product | null;
}

export function ListingForm({ product }: ListingFormPageProps) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category_id: 0,
      listing_type: 'sale',
      location_text: '',
      quantity_available: 1,
      images: [],
    },
    mode: 'onChange'
  });

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

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        title: product.title,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        listing_type: product.listing_type,
        location_text: product.location_text,
        quantity_available: product.quantity_available || 1,
        images: product.images,
      });
      setImagePreviews(product.images || []);
      setImageFiles([]);
    }
  }, [product, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (imagePreviews.length + files.length > 4) {
      toast({ variant: 'destructive', title: 'Upload Error', description: 'You can upload a maximum of 4 images.' });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newImageUrls]);
  };
  
  const removeImage = (index: number) => {
    const urlToRemove = imagePreviews[index];
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    const isNewFile = urlToRemove.startsWith('blob:');
    if (isNewFile) {
        setImageFiles(prev => prev.filter(file => URL.createObjectURL(file) !== urlToRemove));
    } else {
        const existingImages = form.getValues('images') || [];
        form.setValue('images', existingImages.filter(img => img !== urlToRemove));
    }
  }
  
  const onSubmit = async (data: ListingFormValues) => {
    setIsSaving(true);
    try {
        const {data: {user}} = await supabase.auth.getUser();
        if(!user) throw new Error("You must be logged in to create a listing.");

        const uploadedImageUrls: string[] = form.getValues('images') || [];

        for (const file of imageFiles) {
            const filePath = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('product_images')
                .upload(filePath, file);

            if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from('product_images')
                .getPublicUrl(filePath);

            uploadedImageUrls.push(publicUrl);
        }
        
        const isEditing = !!product?.id;
        const endpoint = isEditing ? '/api/adverts/edit' : '/api/adverts/create';
        const payload = { ...data, images: uploadedImageUrls, id: product?.id };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error ? JSON.stringify(result.error) : result.details ? JSON.stringify(result.details) : 'Something went wrong');

        toast({ title: 'Success', description: `Product ${isEditing ? 'updated' : 'created'} successfully.` });
        router.push('/adverts');

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };

  const selectedCategoryId = form.watch('category_id');

  const renderDynamicFields = () => {
    switch (selectedCategoryId) {
      case 14: // Fashion
        return (
          <div className='space-y-4'>
            <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl><SelectContent><SelectItem value="new_with_tags">New with Tags</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="used_like_new">Used - Like New</SelectItem><SelectItem value="used_good">Used - Good</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="size" render={({ field }) => (
                <FormItem><FormLabel>Size</FormLabel><FormControl><Input placeholder="e.g., Medium, 42, 12" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem><FormLabel>Color</FormLabel><FormControl><Input placeholder="e.g., Blue, Multi-color" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        );
      case 13: // Electronics
        return (
          <div className='space-y-4'>
            <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="open_box">Open Box</SelectItem><SelectItem value="used">Used</SelectItem><SelectItem value="for_parts">For Parts/Not Working</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="model_number" render={({ field }) => (
                <FormItem><FormLabel>Model Number</FormLabel><FormControl><Input placeholder="e.g., iPhone 15 Pro" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        );
      case 17: // Services
        return (
          <div className='space-y-4'>
            <FormField control={form.control} name="service_delivery" render={({ field }) => (
                <FormItem><FormLabel>Service Delivery</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select delivery method" /></SelectTrigger></FormControl><SelectContent><SelectItem value="remote">Remote / Online</SelectItem><SelectItem value="on-site">On-site</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem><FormLabel>Availability</FormLabel><FormControl><Input placeholder="e.g., Weekdays 9am - 5pm" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="md:hidden mb-6">
            <Alert variant="destructive">
                <Smartphone className="h-4 w-4" />
                <AlertTitle>Mobile View Not Available</AlertTitle>
                <FormDescription>
                    For the best experience, please create and manage your listings on a desktop device. We are working on an improved mobile version.
                </FormDescription>
            </Alert>
        </div>
        <div className="hidden md:block">
            <Button variant="ghost" onClick={() => router.push('/adverts')} className="mb-4">
                <Undo className="w-4 h-4 mr-2" /> Back to Listings
            </Button>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Core Details</CardTitle>
                            <CardDescription>This information is required for all listings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Product Title</FormLabel><FormControl><Input placeholder="e.g., Handcrafted Leather Bag" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product in detail..." {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="listing_type" render={({ field }) => (
                                    <FormItem><FormLabel>Listing Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a listing type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="sale">For Sale</SelectItem><SelectItem value="barter">For Barter</SelectItem><SelectItem value="freebie">Freebie/Giveaway</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="category_id" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem><FormLabel>Price (£)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="quantity_available" render={({ field }) => (
                                    <FormItem><FormLabel>Quantity Available</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="location_text" render={({ field }) => (
                                <FormItem><FormLabel>Item Location</FormLabel><FormControl><Input placeholder="e.g., London, UK" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div>
                                <FormLabel>Product Images (up to 4)</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {imagePreviews.map((url, index) => (
                                        <div key={index} className="relative aspect-square">
                                            <Image src={url} alt={`upload-preview-${index}`} layout="fill" className="rounded-md object-cover" />
                                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 4 && (
                                        <label htmlFor="image-upload" className="cursor-pointer aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:bg-muted">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <span className="mt-2 text-sm text-muted-foreground">Upload</span>
                                            <input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedCategoryId > 0 && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Category Specifics</CardTitle>
                                <CardDescription>Provide details specific to your chosen category.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               {renderDynamicFields()}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardFooter className="flex justify-end">
                             <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                {product ? 'Save Changes' : 'Create Listing'}
                            </Button>
                        </CardFooter>
                    </Card>

                </form>
            </Form>
        </div>
    </div>
  );
}
