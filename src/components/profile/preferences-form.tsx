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
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  notifications_email: z.boolean(),
  notifications_sms: z.boolean(),
  notifications_push: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof formSchema>;

interface PreferencesFormProps {
  onFeedback: (type: 'success' | 'error', message: string) => void;
}

export function PreferencesForm({ onFeedback }: PreferencesFormProps) {
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'en',
      timezone: 'GMT+0',
      notifications_email: true,
      notifications_sms: false,
      notifications_push: true,
    },
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      // In a real app, this would be fetched from a 'preferences' table linked to the user
      // For now, we simulate loading and use defaults
      setTimeout(() => setIsLoading(false), 500);
    };
    fetchPreferences();
  }, []);

  const onSubmit = async (values: PreferencesFormValues) => {
    setIsSaving(true);
    // In a real app, this would call a Supabase function to update user preferences
    console.log("Saving preferences:", values);
    await new Promise(res => setTimeout(res, 1000));
    onFeedback('success', 'Preferences updated successfully!');
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
                  name="notifications_email"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel htmlFor="email-notifications">Email Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <FormControl>
                        <Switch id="email-notifications" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="notifications_sms"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel htmlFor="sms-notifications">SMS Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                      </div>
                      <FormControl>
                        <Switch id="sms-notifications" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="notifications_push"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel htmlFor="push-notifications">Push Notifications</FormLabel>
                        <p className="text-sm text-muted-foreground">Receive push notifications in-app</p>
                      </div>
                      <FormControl>
                        <Switch id="push-notifications" checked={field.value} onCheckedChange={field.onChange} />
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
