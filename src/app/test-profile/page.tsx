'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { PageLoader } from '@/components/ui/loader';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { getUserProfile } from '@/ai/flows/get-user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function TestProfilePage() {
  const { user, isUserLoading } = useFirebase();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const userProfile = await getUserProfile();
          setProfile(userProfile);
          if (!userProfile) {
            setError('Profile not found in the database. The onUserCreate function may not have run correctly.');
          }
        } catch (e: any) {
          setError(e.message || 'An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      } else if (!isUserLoading) {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isUserLoading]);

  if (isUserLoading || isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>You must be logged in to view this page.</AlertDescription>
            </Alert>
             <Button onClick={() => window.location.href = '/'} className="mt-4">Go to Login</Button>
        </div>
     )
  }

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Test Profile Data</h1>
            <p className="text-muted-foreground">
                This page fetches the raw user profile data directly from your Cloud SQL database to verify that the backend is working correctly.
            </p>
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Fetching Profile</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Cloud SQL Profile Record</CardTitle>
                </CardHeader>
                <CardContent>
                    {profile ? (
                         <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            {JSON.stringify(profile, null, 2)}
                        </pre>
                    ) : (
                        <p>No profile data found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
