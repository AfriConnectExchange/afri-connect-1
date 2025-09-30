'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Loader2, Smartphone, Undo } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertTitle } from '../ui/alert';

import { Step1CoreDetails } from './listing-form-steps/step1-core-details';
import { Step2Specifications } from './listing-form-steps/step2-specifications';
import { Step3MediaAndShipping } from './listing-form-steps/step3-media-shipping';
import type { Product } from '@/app/marketplace/page';


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
  images: z.array(z.string().url()).min(1, 'Please upload at least one image.'),
  
  // Dynamic fields grouped under 'specifications'
  specifications: z.object({
      condition: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      material: z.string().optional(),
      model_number: z.string().optional(),
      storage_capacity: z.string().optional(),
      service_delivery: z.string().optional(),
      availability: z.string().optional(),
      brand: z.string().optional(),
  }).optional(),

  // Shipping fields grouped under 'shipping_policy'
  shipping_policy: z.object({
    package_weight: z.number().positive().optional(),
    package_width: z.number().positive().optional(),
    package_height: z.number().positive().optional(),
    package_length: z.number().positive().optional(),
    domestic_shipping_cost: z.number().min(0).optional(),
    international_shipping_cost: z.number().min(0).optional(),
  }).optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

interface ListingFormPageProps {
  product?: Product | null;
}

const steps = [
  { id: 'step1', name: 'Core Details', fields: ['title', 'description', 'price', 'category_id', 'listing_type', 'location_text', 'quantity_available'] },
  { id: 'step2', name: 'Specifications', fields: ['specifications'] },
  { id: 'step3', name: 'Media & Shipping', fields: ['images', 'shipping_policy'] },
];

export function ListingForm({ product }: ListingFormPageProps) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: product ? {
      ...product,
      specifications: product.specifications || {},
      shipping_policy: product.shipping_policy || {},
    } : {
      title: '',
      description: '',
      price: 0,
      listing_type: 'sale',
      location_text: '',
      quantity_available: 1,
      images: [],
      specifications: {},
      shipping_policy: {},
    },
    mode: 'onChange'
  });
  
  useEffect(() => {
    if (product) {
      methods.reset({
        ...product,
        specifications: product.specifications || {},
        shipping_policy: product.shipping_policy || {},
      });
    }
  }, [product, methods]);


  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const output = await methods.trigger(fields as any, { shouldFocus: true });

    if (!output) return;
    
    if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
    }
  };

  const processForm = async (data: ListingFormValues) => {
    setIsSaving(true);
    try {
        const {data: {user}} = await supabase.auth.getUser();
        if(!user) throw new Error("You must be logged in.");

        const isEditing = !!product?.id;
        const endpoint = isEditing ? '/api/adverts/edit' : '/api/adverts/create';
        
        // Ensure data sent to API matches the expected Zod schema there
        const payload = {
            id: product?.id,
            ...data,
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          const errorMsg = result.error?.issues ? result.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ') : (result.error || 'Something went wrong');
          throw new Error(errorMsg);
        }

        toast({ title: 'Success', description: `Product ${isEditing ? 'updated' : 'created'} successfully.` });
        router.push('/adverts');
        router.refresh();

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };
  
  const selectedCategoryId = methods.watch('category_id');

  return (
     <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
       <div className="md:hidden">
            <Alert variant="destructive">
                <Smartphone className="h-4 w-4" />
                <AlertTitle>Mobile View Not Available</AlertTitle>
                <p className="text-sm">
                    For the best experience, please create and manage your listings on a desktop device.
                </p>
            </Alert>
        </div>

       <div className="hidden md:block">
            <Button variant="ghost" onClick={() => router.push('/adverts')} className="mb-4">
                <Undo className="w-4 h-4 mr-2" /> Back to Listings
            </Button>
             
            <div className="space-y-4">
                <Progress value={((currentStep + 1) / steps.length) * 100} />
                 <h2 className="text-xl font-semibold text-center">{steps[currentStep].name}</h2>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(processForm)} className="mt-8">
                     <Card>
                        <CardContent className="p-6">
                            {currentStep === 0 && <Step1CoreDetails />}
                            {currentStep === 1 && <Step2Specifications categoryId={selectedCategoryId} />}
                            {currentStep === 2 && <Step3MediaAndShipping />}
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-between">
                        <div>
                            {currentStep > 0 && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div>
                            {currentStep < steps.length - 1 && (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <Button type="submit" disabled={isSaving}>
                                     {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="w-4 h-4 mr-2" />
                                    {product ? 'Save Changes' : 'Create Listing'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
       </div>
    </div>
  );
}
