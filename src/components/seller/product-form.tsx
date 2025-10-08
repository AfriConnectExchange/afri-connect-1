
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, UploadCloud, X } from 'lucide-react';
import { Button } from '../ui/button';
import { AnimatedButton } from '../ui/animated-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  quantity_available: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  category_id: z.coerce.number().int().positive('Please select a category.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm() {
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            quantity_available: 1,
            listing_type: 'sale',
            category_id: 0,
        },
    });

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const newImages: string[] = [];

        if (images.length + files.length > 5) {
            toast({
                variant: 'destructive',
                title: 'Too many images',
                description: 'You can upload a maximum of 5 images.',
            });
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImages(prev => [...prev, e.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    }

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);
        if (images.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Image',
                description: 'You must upload at least one product image.',
            });
            setIsSubmitting(false);
            return;
        }
        
        const payload = {
            ...data,
            images: images,
            specifications: {},
            shipping_policy: {},
            location_text: "London", // Placeholder
        };
        
        try {
            const response = await fetch('/api/adverts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong.');
            }

            toast({
                title: 'Product Listed!',
                description: `${data.title} has been successfully added to the marketplace.`,
            });
            // Reset form or redirect
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const ImageUploadPlaceholder = () => (
        <label htmlFor="image-upload" className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <UploadCloud className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500">Upload Image</p>
        </label>
    );

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Media</CardTitle>
                    <CardDescription>Upload up to 5 images. The first image is the main one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={images.length >= 5}
                        />
                        {images.map((src, index) => (
                            <div key={index} className="relative aspect-square">
                                <Image src={src} alt={`Upload preview ${index + 1}`} layout="fill" className="object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && <ImageUploadPlaceholder />}
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="pt-6 space-y-4">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Name *</Label>
                                <FormControl>
                                    <Input placeholder="Ex: Wireless Noise-Cancelling Headphones" {...field} />
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
                                <Label>Description *</Label>
                                <FormControl>
                                     <Textarea placeholder="Describe your product in detail." rows={5} {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Price (£) *</Label>
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
                                    <Label>Stock Quantity *</Label>
                                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="listing_type"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Listing Type *</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="sale">For Sale</SelectItem>
                                        <SelectItem value="barter">For Barter</SelectItem>
                                        <SelectItem value="freebie">Freebie</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

             <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
                <AnimatedButton type="submit" isLoading={isSubmitting}>
                    Save and Continue
                </AnimatedButton>
            </div>
        </form>
        </Form>
    );
}
