'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { Header } from '@/components/dashboard/header';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
        <Header />
        <main className="flex h-[calc(100vh-150px)] flex-col items-center justify-center bg-background px-4 text-center">
            <div className="flex flex-col items-center justify-center">
                 <div className="w-24 h-24 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Something went wrong
                </h1>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                    We're sorry, but it looks like something broke. Please try again.
                </p>
                <div className="mt-8">
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        variant="destructive"
                    >
                        Try again
                    </Button>
                </div>
            </div>
        </main>
    </>
  );
}
