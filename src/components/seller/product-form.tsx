
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function ProductForm() {

    const ImageUploadPlaceholder = ({ label }: { label: string }) => (
        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>Image needs to be between 500x500 and 2000x2000 pixels. White background is recommended.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        <ImageUploadPlaceholder label="Main Image *" />
                        <ImageUploadPlaceholder label="Image 2" />
                        <ImageUploadPlaceholder label="Image 3" />
                        <ImageUploadPlaceholder label="Image 4" />
                        <ImageUploadPlaceholder label="Image 5" />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="pt-6 space-y-4">
                     <div>
                        <Label htmlFor="productName">Name *</Label>
                        <Input id="productName" placeholder="Ex: Wireless Noise-Cancelling Headphones" />
                        <p className="text-xs text-muted-foreground mt-1">Clear product name for a better reach</p>
                    </div>
                     <div>
                        <Label htmlFor="productDescription">Description *</Label>
                        <Textarea id="productDescription" placeholder="Describe your product in detail." rows={5}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="price">Price (£) *</Label>
                            <Input id="price" type="number" placeholder="0.00" />
                        </div>
                         <div>
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input id="stock" type="number" placeholder="0" />
                        </div>
                        <div>
                            <Label htmlFor="listingType">Listing Type *</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sale">For Sale</SelectItem>
                                    <SelectItem value="barter">For Barter</SelectItem>
                                    <SelectItem value="freebie">Freebie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save and Continue</Button>
            </div>
        </div>
    );
}
