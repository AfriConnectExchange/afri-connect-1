'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { KYCData } from "../kyc-flow";

interface BusinessInfoStepProps {
    kycData: KYCData;
    onInputChange: (field: keyof KYCData, value: string) => void;
}

export function BusinessInfoStep({ kycData, onInputChange }: BusinessInfoStepProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                Provide details about your business or trading activities.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                    id="businessName"
                    value={kycData.businessName}
                    onChange={(e) => onInputChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={kycData.businessType} onValueChange={(value) => onInputChange('businessType', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="limited_company">Limited Company</SelectItem>
                        <SelectItem value="cooperative">Cooperative</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="businessRegistrationNumber">Registration Number</Label>
                    <Input
                    id="businessRegistrationNumber"
                    value={kycData.businessRegistrationNumber}
                    onChange={(e) => onInputChange('businessRegistrationNumber', e.target.value)}
                    placeholder="Business registration number"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                    id="taxId"
                    value={kycData.taxId}
                    onChange={(e) => onInputChange('taxId', e.target.value)}
                    placeholder="Tax identification number"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Input
                    id="businessAddress"
                    value={kycData.businessAddress}
                    onChange={(e) => onInputChange('businessAddress', e.target.value)}
                    placeholder="Enter your business address"
                    required
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="businessCity">City *</Label>
                    <Input
                    id="businessCity"
                    value={kycData.businessCity}
                    onChange={(e) => onInputChange('businessCity', e.target.value)}
                    placeholder="City"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessState">State/Province</Label>
                    <Input
                    id="businessState"
                    value={kycData.businessState}
                    onChange={(e) => onInputChange('businessState', e.target.value)}
                    placeholder="State"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessPostalCode">Postal Code</Label>
                    <Input
                    id="businessPostalCode"
                    value={kycData.businessPostalCode}
                    onChange={(e) => onInputChange('businessPostalCode', e.target.value)}
                    placeholder="Postal code"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description *</Label>
                <Textarea
                    id="businessDescription"
                    value={kycData.businessDescription}
                    onChange={(e) => onInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business activities and products/services"
                    rows={3}
                    required
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="estimatedMonthlyVolume">Estimated Monthly Sales Volume</Label>
                    <Select value={kycData.estimatedMonthlyVolume} onValueChange={(value) => onInputChange('estimatedMonthlyVolume', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select volume range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0-50000">£0 - £50,000</SelectItem>
                        <SelectItem value="50000-200000">£50,000 - £200,000</SelectItem>
                        <SelectItem value="200000-500000">£200,000 - £500,000</SelectItem>
                        <SelectItem value="500000-1000000">£500,000 - £1,000,000</SelectItem>
                        <SelectItem value="1000000+">£1,000,000+</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                    id="businessEmail"
                    type="email"
                    value={kycData.businessEmail}
                    onChange={(e) => onInputChange('businessEmail', e.target.value)}
                    placeholder="business@example.com"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                    id="website"
                    type="url"
                    value={kycData.website}
                    onChange={(e) => onInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                />
                </div>
            </CardContent>
        </Card>
    );
}
