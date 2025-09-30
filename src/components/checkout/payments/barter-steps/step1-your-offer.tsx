'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Package, User, AlertCircle, CheckCircle } from "lucide-react";
import type { BarterFormData } from "../BarterProposalForm";

const categories = [
    'Electronics', 'Clothing & Fashion', 'Home & Garden', 'Books & Media', 
    'Sports & Outdoors', 'Automotive', 'Tools & Equipment', 'Art & Crafts',
    'Services', 'Digital Products', 'Other'
];

const conditions = [
    { value: 'new', label: 'New/Unused' },
    { value: 'excellent', label: 'Excellent condition' },
    { value: 'good', label: 'Good condition' },
    { value: 'fair', label: 'Fair condition (some wear)' },
    { value: 'poor', label: 'Poor condition (functional)' }
];

interface BarterStep1Props {
    formData: BarterFormData;
    onInputChange: (field: keyof BarterFormData, value: string) => void;
    errors: Partial<Record<keyof BarterFormData, string>>;
    targetValue: number;
}

export function BarterStep1_YourOffer({ formData, onInputChange, errors, targetValue }: BarterStep1Props) {
    const valueComparison = formData.estimatedValue ? (parseFloat(formData.estimatedValue) / targetValue * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">What are you offering?</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={formData.offerType === 'product' ? 'default' : 'outline'}
                  onClick={() => onInputChange('offerType', 'product')}
                  className="justify-start"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Physical Product
                </Button>
                <Button
                  variant={formData.offerType === 'service' ? 'default' : 'outline'}
                  onClick={() => onInputChange('offerType', 'service')}
                  className="justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Service/Skills
                </Button>
              </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="itemName">{formData.offerType === 'product' ? 'Product Name' : 'Service Title'} *</Label>
                    <Input id="itemName" placeholder={formData.offerType === 'product' ? 'e.g., iPhone 12 Pro Max' : 'e.g., Logo Design Service'} value={formData.itemName} onChange={(e) => onInputChange('itemName', e.target.value)} />
                    {errors.itemName && <p className="text-destructive text-sm mt-1">{errors.itemName}</p>}
                </div>
                <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea id="description" placeholder={formData.offerType === 'product' ? 'Describe the item, features, accessories...' : 'Describe your service, what you deliver...'} value={formData.description} onChange={(e) => onInputChange('description', e.target.value)} rows={3} />
                    {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="estimatedValue">Estimated Value (£) *</Label>
                        <Input id="estimatedValue" type="number" placeholder="0.00" value={formData.estimatedValue} onChange={(e) => onInputChange('estimatedValue', e.target.value)} />
                        {errors.estimatedValue && <p className="text-destructive text-sm mt-1">{errors.estimatedValue}</p>}
                    </div>
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select onValueChange={(value) => onInputChange('category', value)} value={formData.category}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>{categories.map((c) => <SelectItem key={c} value={c.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
                    </div>
                </div>
                {formData.offerType === 'product' && (
                    <div>
                        <Label htmlFor="condition">Item Condition *</Label>
                        <Select onValueChange={(value) => onInputChange('condition', value)} value={formData.condition}>
                            <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                            <SelectContent>{conditions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                        {errors.condition && <p className="text-destructive text-sm mt-1">{errors.condition}</p>}
                    </div>
                )}
            </div>

            {formData.estimatedValue && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Value Comparison</h4>
                    {valueComparison < 80 ? (
                        <div className="flex items-center text-orange-600 text-xs"><AlertCircle className="w-4 h-4 mr-1" />Your offer is significantly lower.</div>
                    ) : valueComparison > 120 ? (
                        <div className="flex items-center text-green-600 text-xs"><CheckCircle className="w-4 h-4 mr-1" />Your offer is higher value - good for negotiation!</div>
                    ) : (
                        <div className="flex items-center text-green-600 text-xs"><CheckCircle className="w-4 h-4 mr-1" />Fair value exchange - great match!</div>
                    )}
                </div>
            )}
        </div>
    );
}
