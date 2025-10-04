
'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ProductForm } from './product-form';
import { CategorySelector } from './category-selector';
import { Separator } from '../ui/separator';

const steps = [
  { id: 'info', name: 'Product Information' },
  { id: 'variants', name: 'Variants' },
  { id: 'specification', name: 'Product Specification' },
];

export function AddProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const Stepper = () => (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= index ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-500'
              }`}
            >
              <span className="text-sm font-bold">{index + 1}</span>
            </div>
            <p
              className={`mt-2 text-xs text-center ${
                currentStep >= index ? 'text-orange-500 font-semibold' : 'text-gray-500'
              }`}
            >
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 mx-4 ${currentStep > index ? 'border-orange-500' : 'border-gray-300'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Products</span>
                <ChevronRight className="h-4 w-4" />
                <span>Add</span>
                 <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Single Product</span>
            </div>
            <h1 className="text-lg font-semibold md:text-2xl">Add Products</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
                <Stepper />
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ProductForm />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <CategorySelector 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
