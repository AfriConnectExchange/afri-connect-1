'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { VerificationStatus } from "../kyc-flow";

interface CompletionStepProps {
    verificationStatus: VerificationStatus;
    onNavigate: (page: string) => void;
}

export function CompletionStep({ verificationStatus, onNavigate }: CompletionStepProps) {
    return (
        <Card>
            <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">KYC Application Submitted</h3>
                <p className="text-muted-foreground mb-6">
                Thank you for submitting your KYC information. Our team will review your application within 2-3 business days.
                </p>
                
                <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                    <span>Application Status:</span>
                    <Badge variant={verificationStatus === 'approved' ? 'default' : verificationStatus === 'rejected' ? 'destructive' : 'secondary'}>
                    {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                    </Badge>
                </div>
                </div>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                <p>What happens next:</p>
                <ul className="space-y-1 text-left max-w-md mx-auto">
                    <li>• We'll verify your documents and information</li>
                    <li>• You'll receive an email with the verification result</li>
                    <li>• Once approved, you can start selling on AfriConnect</li>
                    <li>• If additional information is needed, we'll contact you</li>
                </ul>
                </div>
                
                <div className="mt-6 space-y-2">
                <Button onClick={() => onNavigate('/marketplace')} className="w-full">
                    Return to Marketplace
                </Button>
                <Button variant="outline" onClick={() => onNavigate('/profile')} className="w-full">
                    View Profile
                </Button>
                </div>
            </CardContent>
        </Card>
    );
}
