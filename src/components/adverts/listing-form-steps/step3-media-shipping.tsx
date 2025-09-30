'use client';
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function Step3MediaAndShipping() {
  const { control, getValues, setValue, watch } = useFormContext();
  const { toast } = useToast();
  const supabase = createClient();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const existingImages = watch('images', []);
  const [imagePreviews, setImagePreviews] = useState<string[]>(existingImages);

  useEffect(() => {
    setImagePreviews(existingImages);
  }, [existingImages]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (imagePreviews.length + files.length > 4) {
      toast({ variant: 'destructive', title: 'Upload Error', description: 'You can upload a maximum of 4 images.' });
      return;
    }

    const validFiles = [];
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'File Too Large', description: `${file.name} is larger than 5MB.` });
            continue;
        }
        validFiles.push(file);
    }
    
    // Simulate upload and get URLs
    const newImageUrls: string[] = [];
    for (const file of validFiles) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) continue;

        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('product_images').upload(filePath, file);

        if (uploadError) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: uploadError.message });
            continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(filePath);
        newImageUrls.push(publicUrl);
    }

    const currentImages = getValues('images') || [];
    setValue('images', [...currentImages, ...newImageUrls]);
    setImagePreviews(prev => [...prev, ...newImageUrls]);
  };
  
  const removeImage = (index: number) => {
    const urlToRemove = imagePreviews[index];
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    setValue('images', updatedPreviews);
  }

  return (
    <div className="space-y-8">
      <div>
        <FormField
          control={control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Product Images (up to 4) *</FormLabel>
              <FormControl>
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Shipping Details (Optional)</h3>
        <div className="space-y-4 rounded-md border p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={control} name="shipping_policy.package_weight" render={({ field }) => (
                    <FormItem><FormLabel>Package Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="shipping_policy.domestic_shipping_cost" render={({ field }) => (
                    <FormItem><FormLabel>Domestic Shipping Cost (£)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={control} name="shipping_policy.package_length" render={({ field }) => (
                    <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="shipping_policy.package_width" render={({ field }) => (
                    <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="shipping_policy.package_height" render={({ field }) => (
                    <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <FormField control={control} name="shipping_policy.international_shipping_cost" render={({ field }) => (
                <FormItem><FormLabel>International Shipping Cost (£)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
      </div>
    </div>
  );
}
