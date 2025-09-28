'use client';

import { useState, useEffect } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { testDbConnection } from '@/ai/flows/test-db-connection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function TestDbPage() {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        setIsLoading(true);
        const result = await testDbConnection();
        setDbStatus(result);
      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDbStatus();
  }, []);

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Database Connection Test</h1>
            <p className="text-muted-foreground">
                This page performs a direct test of the backend's ability to connect to your Cloud SQL database and run a simple query.
            </p>
            
            {isLoading && <PageLoader />}
            
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {dbStatus && (
                 <Alert className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 [&>svg]:text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Connection Successful!</AlertTitle>
                    <AlertDescription>The backend successfully connected to the Cloud SQL database.</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Test Result</CardTitle>
                    <CardDescription>
                        The backend tried to run `SELECT NOW()` on your database. Here is the result.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {dbStatus ? (
                         <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            {JSON.stringify(dbStatus, null, 2)}
                        </pre>
                    ) : (
                       !isLoading && <p>No result was returned.</p>
                    )}
                </CardContent>
            </Card>
             <Button onClick={() => window.location.reload()}>Re-run Test</Button>
        </div>
      </main>
    </>
  );
}
