import Link from 'next/link';
import { Layers } from 'lucide-react';

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9-6.1-1.4-12.1-4.1-16.1-6.4 0 0-2.2 4.1 3.2 8.1-1.3 1-3.3 2.1-3.3 2.1s1.3 2.1 4.3 3.4c-2.1 1.4-4.3 2.1-4.3 2.1s-1.8-1.4 1.3-4.4c0 0-2.1-1.4-4.3-4.4 0 0 3.3 1.4 6.3 1.4s4.3-1.4 4.3-1.4-1.3-1.4-2.3-2.4c1.3-1.4 3.3-3.4 3.3-3.4s-1.3 1.4-2.3 2.4c0 0 1.3-1.4 2.3-2.4 0 0 .5-1.4-2.3 1.4z" />
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Layers className="h-6 w-6 text-primary" />
            <span className="font-bold">AfriConnect</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium mb-4 md:mb-0">
            <Link href="#" className="text-foreground/70 hover:text-foreground">About</Link>
            <Link href="#" className="text-foreground/70 hover:text-foreground">Contact</Link>
            <Link href="#" className="text-foreground/70 hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="text-foreground/70 hover:text-foreground">Privacy Policy</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="#" aria-label="Twitter" className="text-foreground/70 hover:text-foreground"><TwitterIcon className="w-5 h-5" /></Link>
            <Link href="#" aria-label="Facebook" className="text-foreground/70 hover:text-foreground"><FacebookIcon className="w-5 h-5" /></Link>
            <Link href="#" aria-label="Instagram" className="text-foreground/70 hover:text-foreground"><InstagramIcon className="w-5 h-5" /></Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-foreground/70">
          © {new Date().getFullYear()} AfriConnect Exchange. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
