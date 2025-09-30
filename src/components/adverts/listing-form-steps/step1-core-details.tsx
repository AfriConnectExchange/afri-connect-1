'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

export function Step1CoreDetails() {
  const { control } = useFormContext();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const cats = await res.json();
          setCategories(cats.filter((c: any) => c.id !== 'all'));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <FormField control={control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Product Title *</FormLabel><FormControl><Input placeholder="e.g., Handcrafted Leather Bag" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description *</FormLabel><FormControl><Textarea placeholder="Describe your product in detail..." {...field} rows={6} /></FormControl><FormMessage /></FormItem>
      )} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={control} name="listing_type" render={({ field }) => (
              <FormItem><FormLabel>Listing Type *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a listing type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="sale">For Sale</SelectItem><SelectItem value="barter">For Barter</SelectItem><SelectItem value="freebie">Freebie/Giveaway</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="category_id" render={({ field }) => (
              <FormItem><FormLabel>Category *</FormLabel><Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Price (£) *</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="quantity_available" render={({ field }) => (
              <FormItem><FormLabel>Quantity Available *</FormLabel><FormControl><Input type="number" placeholder="1" {...field} min="1" step="1" /></FormControl><FormMessage /></FormItem>
          )} />
      </div>
       <FormField control={control} name="location_text" render={({ field }) => (
          <FormItem><FormLabel>Item Location *</FormLabel><FormControl><Input placeholder="e.g., London, UK" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}
