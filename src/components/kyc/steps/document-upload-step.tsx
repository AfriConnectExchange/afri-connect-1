'use client';
import { Upload, FileText, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DocumentUpload } from "../kyc-flow";
import { useUser } from '@/firebase';
import { useState } from 'react';

interface DocumentUploadStepProps {
    documents: DocumentUpload[];
    setDocuments: React.Dispatch<React.SetStateAction<DocumentUpload[]>>;
    setError: (error: string) => void;
}

export function DocumentUploadStep({ documents, setDocuments, setError }: DocumentUploadStepProps) {
    const { user } = useUser();
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

    const handleFileUpload = async (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('File must be JPEG, PNG, or PDF format');
            return;
        }

        setError('');
        setUploadingDocId(documentId);

        try {
            if (!user) {
                throw new Error("You must be logged in to upload documents.");
            }
            
            // This logic needs to be connected to a storage service like Firebase Storage
            console.log(`Uploading ${file.name} for document ${documentId}`);
            
            // Simulate upload
            await new Promise(resolve => setTimeout(resolve, 1500));

            setDocuments(prev => 
                prev.map(doc => 
                    doc.id === documentId 
                    ? { ...doc, file, uploaded: true, status: 'pending' }
                    : doc
                )
            );

        } catch(error: any) {
            setError(`Upload failed: ${error.message}`);
        } finally {
            setUploadingDocId(null);
        }
    };

    const removeDocument = (documentId: string) => {
        setDocuments(prev => 
        prev.map(doc => 
            doc.id === documentId 
            ? { ...doc, file: null, uploaded: false, status: 'pending' }
            : doc
        )
        );
    };

    return (
        <Card>
        <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
            Upload clear, high-quality images or PDFs of the required documents.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {documents.map((document) => (
            <div key={document.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{document.name}</span>
                    {document.required && <Badge variant="secondary">Required</Badge>}
                </div>
                {document.uploaded && (
                    <Badge variant={document.status === 'approved' ? 'default' : document.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {document.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {document.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </Badge>
                )}
                </div>
                
                {document.uploaded && document.file ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{document.file.name}</span>
                    <span className="text-xs text-muted-foreground">
                        ({(document.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(document.id)}
                    >
                    Remove
                    </Button>
                </div>
                ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                    Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                    PNG, JPG, PDF up to 5MB
                    </p>
                    <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => handleFileUpload(document.id, e)}
                    className="hidden"
                    id={`file-${document.id}`}
                    disabled={!!uploadingDocId}
                    />
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.document.getElementById(`file-${document.id}`)?.click()}
                    disabled={!!uploadingDocId}
                    >
                      {uploadingDocId === document.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                          <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploadingDocId === document.id ? 'Uploading...' : 'Choose File'}
                    </Button>
                </div>
                )}
            </div>
            ))}
            
            <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
                All documents are encrypted and stored securely. We only use them for verification purposes and comply with data protection regulations.
            </AlertDescription>
            </Alert>
        </CardContent>
        </Card>
    );
}
