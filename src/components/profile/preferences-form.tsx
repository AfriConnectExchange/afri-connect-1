'use client';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  notifications_email_marketing: z.boolean(),
  notifications_push_marketing: z.boolean(),
  notifications_email_orders: z.boolean(),
  notifications_push_orders: z.boolean(),
  notifications_sms_orders: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof formSchema>;

interface PreferencesFormProps {
  onFeedback: (type: 'success' | 'error', message: string) => void;
}

export function PreferencesForm({ onFeedback }: PreferencesFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'en',
      timezone: 'UTC',
      notifications_email_marketing: true,
      notifications_push_marketing: false,
      notifications_email_orders: true,
      notifications_push_orders: true,
      notifications_sms_orders: false,
    },
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      if (user) {
        const docRef = doc(firestore, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profile = docSnap.data();
          form.reset({
            language: profile.language || 'en',
            timezone: profile.timezone || 'UTC',
            notifications_email_marketing: profile.notification_preferences?.email_marketing ?? true,
            notifications_push_marketing: profile.notification_preferences?.push_marketing ?? false,
            notifications_email_orders: profile.notification_preferences?.email_orders ?? true,
            notifications_push_orders: profile.notification_preferences?.push_orders ?? true,
            notifications_sms_orders: profile.notification_preferences?.sms_orders ?? false,
          });
        }
      }
      setIsLoading(false);
    };
    fetchPreferences();
  }, [user, firestore, form]);

  const onSubmit = async (values: PreferencesFormValues) => {
    setIsSaving(true);
    if (!user) {
      onFeedback('error', 'User not found.');
      setIsSaving(false);
      return;
    }

    try {
        await setDoc(doc(firestore, "profiles", user.uid), {
            language: values.language,
            timezone: values.timezone,
            notification_preferences: {
            email_marketing: values.notifications_email_marketing,
            push_marketing: values.notifications_push_marketing,
            email_orders: values.notifications_email_orders,
            push_orders: values.notifications_push_orders,
            sms_orders: values.notifications_sms_orders,
            },
        }, { merge: true });
        onFeedback('success', 'Preferences updated successfully!');
    } catch(error: any) {
        onFeedback('error', 'Failed to update preferences: ' + error.message);
    }
    setIsSaving(false);
  };
  
   if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience on AfriConnect Exchange.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience on AfriConnect Exchange.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="am">Amharic</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GMT-1">GMT-1</SelectItem>
                        <SelectItem value="GMT+0">GMT+0 (London)</SelectItem>
                        <SelectItem value="GMT+1">GMT+1 (Lagos)</SelectItem>
                        <SelectItem value="GMT+2">GMT+2</SelectItem>
                        <SelectItem value="GMT+3">GMT+3 (Nairobi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Notification Preferences</h4>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="notifications_email_orders"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel htmlFor="email-orders">Order Updates (Email)</FormLabel>
                      </div>
                      <FormControl>
                        <Switch id="email-orders" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="notifications_sms_orders"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                       <div>
                        <FormLabel htmlFor="sms-orders">Order Updates (SMS)</FormLabel>
                      </div>
                      <FormControl>
                        <Switch id="sms-orders" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="notifications_email_marketing"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel htmlFor="email-marketing">Marketing (Email)</FormLabel>
                      </div>
                      <FormControl>
                        <Switch id="email-marketing" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
             <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Preferences
              </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
