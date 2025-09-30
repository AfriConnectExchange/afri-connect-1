'use client';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step2SpecificationsProps {
  categoryId: number;
}

export function Step2Specifications({ categoryId }: Step2SpecificationsProps) {
  const { control } = useFormContext();

  const renderFashionFields = () => (
    <>
      <FormField control={control} name="specifications.condition" render={({ field }) => (
          <FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl><SelectContent><SelectItem value="new_with_tags">New with Tags</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="used_like_new">Used - Like New</SelectItem><SelectItem value="used_good">Used - Good</SelectItem></SelectContent></Select><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="specifications.size" render={({ field }) => (
          <FormItem><FormLabel>Size</FormLabel><FormControl><Input placeholder="e.g., Medium, 42, 12" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="specifications.color" render={({ field }) => (
          <FormItem><FormLabel>Color</FormLabel><FormControl><Input placeholder="e.g., Blue, Multi-color" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="specifications.material" render={({ field }) => (
          <FormItem><FormLabel>Material</FormLabel><FormControl><Input placeholder="e.g., Cotton, Leather" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </>
  );

  const renderElectronicsFields = () => (
    <>
      <FormField control={control} name="specifications.condition" render={({ field }) => (
          <FormItem><FormLabel>Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="open_box">Open Box</SelectItem><SelectItem value="used">Used</SelectItem><SelectItem value="for_parts">For Parts/Not Working</SelectItem></SelectContent></Select><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="specifications.brand" render={({ field }) => (
        <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g., Apple, Samsung" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="specifications.model_number" render={({ field }) => (
          <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., iPhone 15 Pro, Galaxy S24" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="specifications.storage_capacity" render={({ field }) => (
          <FormItem><FormLabel>Storage Capacity</FormLabel><FormControl><Input placeholder="e.g., 256GB" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </>
  );
  
  const renderServicesFields = () => (
     <>
        <FormField control={control} name="specifications.service_delivery" render={({ field }) => (
            <FormItem><FormLabel>Service Delivery</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select delivery method" /></SelectTrigger></FormControl><SelectContent><SelectItem value="remote">Remote / Online</SelectItem><SelectItem value="on-site">On-site</SelectItem></SelectContent></Select><FormMessage /></FormItem>
        )} />
         <FormField control={control} name="specifications.availability" render={({ field }) => (
            <FormItem><FormLabel>Availability</FormLabel><FormControl><Input placeholder="e.g., Weekdays 9am - 5pm" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
     </>
  );

  const renderFields = () => {
    switch (categoryId) {
      case 14: // Fashion
        return renderFashionFields();
      case 13: // Electronics
        return renderElectronicsFields();
      case 17: // Services
        return renderServicesFields();
      default:
        return <p className="text-muted-foreground text-center">No specific information required for this category. You can add more details in the description.</p>;
    }
  };

  return <div className="space-y-6">{renderFields()}</div>;
}
