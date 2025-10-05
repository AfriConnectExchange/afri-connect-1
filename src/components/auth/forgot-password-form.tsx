
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { AnimatedButton } from '../ui/animated-button';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
       toast({
        title: 'Password Reset Link Sent',
        description:
          'If an account exists for this email, you will receive a password reset link.',
      });
      setEmailSent(true);
    } catch (error: any) {
        toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
    setIsLoading(false);
  }

  if(emailSent) {
    return (
       <Card>
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                 <MailCheck className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
                A password reset link has been sent to <strong>{form.getValues('email')}</strong>. Please check your inbox.
            </CardDescription>
        </CardHeader>
       </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AnimatedButton type="submit" className="w-full" isLoading={isLoading}>
              Send Reset Link
            </AnimatedButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
