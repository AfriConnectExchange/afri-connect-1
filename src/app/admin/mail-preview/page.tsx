
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AnimatedButton } from '@/components/ui/animated-button';

const emailTemplates = [
  { id: 'welcome_email', name: 'Welcome Email' },
  { id: 'login_alert', name: 'New Login Alert' },
  { id: 'password_reset_confirmation', name: 'Password Reset Confirmation' },
];

export default function MailPreviewPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('welcome_email');
  const [recipient, setRecipient] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchPreview = async (templateId: string) => {
    setIsLoadingPreview(true);
    try {
      const res = await fetch(`/api/admin/mail-preview?template=${templateId}`);
      if (res.ok) {
        setPreviewHtml(await res.text());
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch preview.' });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch preview.' });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const sendTestEmail = async () => {
    if (!recipient) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a recipient email.' });
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/mail-preview/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, templateId: selectedTemplate }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send');
      toast({ title: 'Success', description: 'Test email has been sent.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to send email: ${e.message}` });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle>Email Template Preview</CardTitle>
        <CardDescription>Preview and test transactional emails.</CardDescription>
      </CardHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-select">Select Template</Label>
                <Select value={selectedTemplate} onValueChange={(val) => {setSelectedTemplate(val); fetchPreview(val);}}>
                  <SelectTrigger id="template-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => fetchPreview(selectedTemplate)} className="w-full" disabled={isLoadingPreview}>
                Refresh Preview
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Send Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient-email">Recipient</Label>
                <Input id="recipient-email" type="email" placeholder="test@example.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
              <AnimatedButton onClick={sendTestEmail} className="w-full" isLoading={isSending} disabled={!recipient}>
                Send Test Email
              </AnimatedButton>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md aspect-video h-[600px] w-full bg-white">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <iframe srcDoc={previewHtml} className="w-full h-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
