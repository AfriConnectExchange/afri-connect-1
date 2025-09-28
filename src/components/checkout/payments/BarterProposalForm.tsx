'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Handshake, Package, User, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BarterProposalFormProps {
  targetProduct: {
    id: any;
    name: string;
    seller: string;
    estimatedValue: number;
  };
  onConfirm: (data: any) => void;
  onCancel: () => void;
}

export function BarterProposalForm({ targetProduct, onConfirm, onCancel }: BarterProposalFormProps) {
  const [formData, setFormData] = useState({
    offerType: 'product', // 'product' or 'service'
    itemName: '',
    description: '',
    estimatedValue: '',
    condition: '',
    category: '',
    exchangeLocation: 'seller_location',
    proposalExpiry: '7',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName || formData.itemName.length < 3) {
      newErrors.itemName = 'Item/service name must be at least 3 characters';
    }

    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.estimatedValue || parseFloat(formData.estimatedValue) <= 0) {
      newErrors.estimatedValue = 'Please enter a valid estimated value';
    }

    if (formData.offerType === 'product' && !formData.condition) {
      newErrors.condition = 'Please select item condition';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    const expiryDays = parseInt(formData.proposalExpiry);
    if (expiryDays < 1 || expiryDays > 7) {
      newErrors.proposalExpiry = 'Expiry must be between 1-7 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate proposal submission
    setTimeout(() => {
      const proposalData = {
        paymentMethod: 'barter_proposal',
        targetProduct: targetProduct,
        offer: {
          type: formData.offerType,
          name: formData.itemName,
          description: formData.description,
          estimatedValue: parseFloat(formData.estimatedValue),
          condition: formData.condition,
          category: formData.category,
          exchangeLocation: formData.exchangeLocation,
          additionalNotes: formData.additionalNotes
        },
        proposalId: `BP${Date.now()}`,
        expiresAt: new Date(Date.now() + parseInt(formData.proposalExpiry) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      onConfirm(proposalData);
      setIsSubmitting(false);
    }, 1500);
  };

  const valueComparison = formData.estimatedValue ? 
    (parseFloat(formData.estimatedValue) / targetProduct.estimatedValue * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Handshake className="w-5 h-5" />
          <span>Barter Proposal</span>
          <Badge variant="secondary" className="text-xs">
            No Money Exchange
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Product Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">You want to trade for:</h4>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{targetProduct.name}</p>
              <p className="text-sm text-muted-foreground">Seller: {targetProduct.seller}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Value</p>
              <p className="font-semibold">£{targetProduct.estimatedValue}</p>
            </div>
          </div>
        </div>

        {/* Offer Type Selection */}
        <div className="space-y-3">
          <Label className="text-base">What are you offering?</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={formData.offerType === 'product' ? 'default' : 'outline'}
              onClick={() => handleInputChange('offerType', 'product')}
              className="justify-start"
            >
              <Package className="w-4 h-4 mr-2" />
              Physical Product
            </Button>
            <Button
              variant={formData.offerType === 'service' ? 'default' : 'outline'}
              onClick={() => handleInputChange('offerType', 'service')}
              className="justify-start"
            >
              <User className="w-4 h-4 mr-2" />
              Service/Skills
            </Button>
          </div>
        </div>

        {/* Offer Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="itemName">
              {formData.offerType === 'product' ? 'Product Name' : 'Service Title'} *
            </Label>
            <Input
              id="itemName"
              placeholder={formData.offerType === 'product' ? 
                'e.g., iPhone 12 Pro Max' : 
                'e.g., Logo Design Service'
              }
              value={formData.itemName}
              onChange={(e) => handleInputChange('itemName', e.target.value)}
            />
            {errors.itemName && <p className="text-destructive text-sm mt-1">{errors.itemName}</p>}
          </div>

          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder={formData.offerType === 'product' ? 
                'Describe the item, its features, any accessories included, etc. (minimum 20 characters)' :
                'Describe your service, what you will deliver, timeline, etc. (minimum 20 characters)'
              }
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.description.length}/20 characters minimum
            </div>
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedValue">Estimated Value (£) *</Label>
              <Input
                id="estimatedValue"
                type="number"
                placeholder="0.00"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                step="0.01"
                min="0"
              />
              {errors.estimatedValue && <p className="text-destructive text-sm mt-1">{errors.estimatedValue}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)} value={formData.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {formData.offerType === 'product' && (
            <div>
              <Label htmlFor="condition">Item Condition *</Label>
              <Select onValueChange={(value) => handleInputChange('condition', value)} value={formData.condition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && <p className="text-destructive text-sm mt-1">{errors.condition}</p>}
            </div>
          )}
        </div>

        {/* Value Comparison */}
        {formData.estimatedValue && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Value Comparison</h4>
            <div className="flex justify-between items-center">
              <span>Your offer: £{parseFloat(formData.estimatedValue).toFixed(2)}</span>
              <span>Their item: £{targetProduct.estimatedValue.toFixed(2)}</span>
            </div>
            <div className="mt-2">
              {valueComparison < 80 ? (
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Your offer is significantly lower than their item</span>
                </div>
              ) : valueComparison > 120 ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Your offer is higher value - good for negotiation!</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Fair value exchange - great match!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exchange Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="exchangeLocation">Preferred Exchange Location</Label>
            <Select 
              value={formData.exchangeLocation} 
              onValueChange={(value) => handleInputChange('exchangeLocation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller_location">Seller's preferred location</SelectItem>
                <SelectItem value="buyer_location">My location</SelectItem>
                <SelectItem value="mutual_location">Mutually agreed location</SelectItem>
                <SelectItem value="shipping">Ship to each other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="proposalExpiry">Proposal Valid For</Label>
            <Select 
              value={formData.proposalExpiry} 
              onValueChange={(value) => handleInputChange('proposalExpiry', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
            {errors.proposalExpiry && <p className="text-destructive text-sm mt-1">{errors.proposalExpiry}</p>}
          </div>

          <div>
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any additional information, special requests, or terms..."
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Important Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Barter Guidelines:</strong> This proposal will be sent to the seller. 
            If accepted, you'll both need to coordinate the exchange details. 
            AfriConnect provides the platform but does not handle the physical exchange.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Proposal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Sending Proposal...' : 'Send Barter Proposal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
