'use client';

import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/dashboard/header';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex h-[calc(100vh-150px)] flex-col items-center justify-center bg-background px-4 text-center">
        <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <SearchX className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                404 - Page Not Found
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
                Oops! The page you're looking for doesn't seem to exist. It might have been moved, deleted, or you might have mistyped the URL.
            </p>
            <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="/marketplace">Return to Marketplace</Link>
                </Button>
            </div>
        </div>
      </main>
    </>
  );
}
