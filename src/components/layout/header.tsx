import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Layers, Menu } from 'lucide-react';

export default function Header() {
  const navLinks = [
    { href: '#', label: 'Marketplace' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#features', label: 'Features' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Layers className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">AfriConnect</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/70 transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="#">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="#">Sign Up</Link>
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <Layers className="h-6 w-6 text-primary" />
                    <span className="font-bold">AfriConnect Exchange</span>
                  </Link>
                  <nav className="grid gap-2">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="flex w-full items-center py-2 text-lg font-semibold">
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
