'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AnimatedButton } from '@/components/ui/animated-button';
import Link from 'next/link';

const pinSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits.').regex(/^\d{4}$/, 'PIN must be numeric.'),
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

type PinFormValues = z.infer<typeof pinSchema>;

export default function PinSettingsPage() {
  const { toast } = useToast();

  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '', confirmPin: '' },
  });

  const onSubmit = async (data: PinFormValues) => {
    // In a real app, you would securely save this PIN.
    toast({ title: 'Success', description: 'Your PIN has been set successfully.' });
    form.reset();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction PIN</CardTitle>
          <CardDescription>Set up a 4-digit PIN for authorizing transactions.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New 4-Digit PIN</FormLabel>
                    <FormControl>
                      <Input type="password" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New PIN</FormLabel>
                    <FormControl>
                      <Input type="password" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <Button variant="outline" asChild><Link href="/profile">Cancel</Link></Button>
              <AnimatedButton type="submit" isLoading={form.formState.isSubmitting}>Set PIN</AnimatedButton>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
