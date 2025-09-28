'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { KYCData, DocumentUpload } from "../kyc-flow";

interface ReviewStepProps {
    kycData: KYCData;
    documents: DocumentUpload[];
}

export function ReviewStep({ kycData, documents }: ReviewStepProps) {
    return (
        <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>Review Your Information</CardTitle>
            <CardDescription>
                Please review all the information before submitting your KYC application.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div>
                <h4 className="font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {kycData.fullName}</div>
                <div><span className="text-muted-foreground">Date of Birth:</span> {kycData.dateOfBirth}</div>
                <div><span className="text-muted-foreground">Nationality:</span> {kycData.nationality}</div>
                <div><span className="text-muted-foreground">ID Type:</span> {kycData.idType}</div>
                <div><span className="text-muted-foreground">ID Number:</span> {kycData.idNumber}</div>
                <div><span className="text-muted-foreground">Phone:</span> {kycData.primaryPhone}</div>
                <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {kycData.address}, {kycData.city}</div>
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="font-semibold mb-3">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Business Name:</span> {kycData.businessName}</div>
                <div><span className="text-muted-foreground">Type:</span> {kycData.businessType}</div>
                <div><span className="text-muted-foreground">Registration Number:</span> {kycData.businessRegistrationNumber || 'N/A'}</div>
                <div><span className="text-muted-foreground">Tax ID:</span> {kycData.taxId || 'N/A'}</div>
                <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {kycData.businessAddress}, {kycData.businessCity}</div>
                <div className="md:col-span-2"><span className="text-muted-foreground">Description:</span> {kycData.businessDescription}</div>
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="font-semibold mb-3">Documents</h4>
                <div className="space-y-2">
                {documents.filter(doc => doc.uploaded).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between text-sm">
                    <span>{doc.name}</span>
                    <Badge variant="secondary">Uploaded</Badge>
                    </div>
                ))}
                </div>
            </div>
            </CardContent>
        </Card>
        </div>
    );
}
