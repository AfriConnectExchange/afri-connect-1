'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { KYCData } from "../kyc-flow";
import PhoneInput from 'react-phone-number-input';

interface PersonalInfoStepProps {
    kycData: KYCData;
    onInputChange: (field: keyof KYCData, value: string) => void;
}

export function PersonalInfoStep({ kycData, onInputChange }: PersonalInfoStepProps) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
            Provide your personal details as they appear on your government-issued ID.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                id="fullName"
                value={kycData.fullName}
                onChange={(e) => onInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                id="dateOfBirth"
                type="date"
                value={kycData.dateOfBirth}
                onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
                required
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select value={kycData.nationality} onValueChange={(value) => onInputChange('nationality', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="gb">🇬🇧 British</SelectItem>
                    <SelectItem value="ng">🇳🇬 Nigerian</SelectItem>
                    <SelectItem value="gh">🇬🇭 Ghanaian</SelectItem>
                    <SelectItem value="ke">🇰🇪 Kenyan</SelectItem>
                    <SelectItem value="za">🇿🇦 South African</SelectItem>
                    <SelectItem value="eg">🇪🇬 Egyptian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="idType">ID Type *</Label>
                <Select value={kycData.idType} onValueChange={(value) => onInputChange('idType', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
                </Select>
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number *</Label>
            <Input
                id="idNumber"
                value={kycData.idNumber}
                onChange={(e) => onInputChange('idNumber', e.target.value)}
                placeholder="Enter your ID number"
                required
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
                id="address"
                value={kycData.address}
                onChange={(e) => onInputChange('address', e.target.value)}
                placeholder="Enter your full address"
                required
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                id="city"
                value={kycData.city}
                onChange={(e) => onInputChange('city', e.target.value)}
                placeholder="City"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="state">County</Label>
                <Input
                id="state"
                value={kycData.state}
                onChange={(e) => onInputChange('state', e.target.value)}
                placeholder="County"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                id="postalCode"
                value={kycData.postalCode}
                onChange={(e) => onInputChange('postalCode', e.target.value)}
                placeholder="Postal code"
                />
            </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone Number *</Label>
                <PhoneInput
                    id="primaryPhone"
                    value={kycData.primaryPhone}
                    onChange={(value) => onInputChange('primaryPhone', value || '')}
                    placeholder="Enter your phone number"
                    defaultCountry="GB"
                    international
                    required
                />
            </div>
        </CardContent>
        </Card>
    );
}
