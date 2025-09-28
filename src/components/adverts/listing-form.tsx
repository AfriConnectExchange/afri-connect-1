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
import { Upload, X, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Product } from '@/app/marketplace/page';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const listingFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.preprocess(
    (a) => parseFloat(String(a) || '0'),
    z.number().min(0, 'Price must be a positive number.')
  ),
  category_id: z.string().min(1, 'Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity_available: z.preprocess(
    (a) => parseInt(String(a) || '1', 10),
    z.number().int().min(1, 'Quantity must be at least 1.')
  ),
  images: z.array(z.string()).optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

interface ListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product?: Product | null;
}

const steps = [
    { id: 'details', name: 'Details', fields: ['title', 'description'] },
    { id: 'category', name: 'Categorization', fields: ['listing_type', 'category_id'] },
    { id: 'pricing', name: 'Pricing & Stock', fields: ['price', 'quantity_available'] },
    { id: 'media', name: 'Media', fields: ['images'] },
    { id: 'location', name: 'Location', fields: ['location_text'] }
];

export function ListingForm({ isOpen, onClose, onSave, product }: ListingFormProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

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
      quantity_available: 1,
      images: [],
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
        quantity_available: product.quantity_available || 1,
        images: product.images,
      });
      setImagePreviews(product.images || []);
      setImageFiles([]);
    } else {
      form.reset();
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [product, form, isOpen]);


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
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }
  
  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });

    if (!output) return;
    
    if (currentStep < steps.length - 1) {
        setCurrentStep(step => step + 1);
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
        setCurrentStep(step => step - 1);
    }
  }

  const onSubmit = async (data: ListingFormValues) => {
    setIsSaving(true);

    try {
        const {data: {user}} = await supabase.auth.getUser();
        if(!user) throw new Error("You must be logged in to create a listing.");

        const uploadedImageUrls = [];

        for (const file of imageFiles) {
            const filePath = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('product_images')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product_images')
                .getPublicUrl(filePath);

            uploadedImageUrls.push(publicUrl);
        }
        
        const finalData = { 
            ...product, 
            ...data, 
            images: [...(product?.images || []), ...uploadedImageUrls] 
        };
        onSave(finalData);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };
  
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{product ? 'Edit Listing' : 'Create New Listing'}</DialogTitle>
          <DialogDescription>
             {steps[currentStep].name} - Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>
        <Progress value={progress} className="w-[96%] mx-auto h-2" />
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {currentStep === 0 && (
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Handcrafted Leather Bag" {...field} /></FormControl>
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
                        <FormControl><Textarea placeholder="Describe your product in detail..." {...field} rows={6} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            )}
            
            {currentStep === 1 && (
                <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="listing_type"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Listing Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a listing type" /></SelectTrigger></FormControl>
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
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {currentStep === 2 && (
                 <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price (£)</FormLabel>
                            <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="quantity_available"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Quantity Available</FormLabel>
                            <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {currentStep === 3 && (
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
            )}
            
            {currentStep === 4 && (
                 <FormField
                    control={form.control}
                    name="location_text"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item Location</FormLabel>
                        <FormControl><Input placeholder="e.g., London, UK" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
             <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-6 px-6 -mx-6 flex-row justify-between">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSaving}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                 {currentStep === steps.length - 1 ? (
                    <Button type="submit" disabled={isSaving} onClick={form.handleSubmit(onSubmit)}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? 'Save Changes' : 'Create Listing'}
                    </Button>
                ) : (
                    <Button type="button" onClick={nextStep} disabled={isSaving}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
