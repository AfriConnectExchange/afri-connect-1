'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Package,
  Inbox,
  Star,
  Heart,
  Users,
  Clock,
  CreditCard,
  Book,
  Mail,
  LogOut,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export function ProfileSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const navGroups = [
    {
      title: 'My Account',
      items: [
        { href: '/profile', label: 'Account Overview', icon: User },
        { href: '/orders', label: 'Orders', icon: Package },
        { href: '#', label: 'Inbox', icon: Inbox },
        { href: '#', label: 'Pending Reviews', icon: Star },
        { href: '#', label: 'Voucher', icon: '🎁' },
        { href: '#', label: 'Wishlist', icon: Heart },
        { href: '#', label: 'Followed Sellers', icon: Users },
        { href: '#', label: 'Recently Viewed', icon: Clock },
      ],
    },
    {
      title: 'Account Management',
      items: [
        { href: '#', label: 'Payment Settings', icon: CreditCard },
        { href: '#', label: 'Address Book', icon: Book },
        { href: '#', label: 'Newsletter Preferences', icon: Mail },
        { href: '#', label: 'Close Account', icon: XCircle },
      ],
    },
  ];

  return (
    <Card>
      <CardContent className="p-3">
        <nav className="space-y-4">
          {navGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {typeof item.icon === 'string' ? (
                      <span className="text-lg">{item.icon}</span>
                    ) : (
                      <item.icon className="h-4 w-4" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              {groupIndex < navGroups.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
          <Separator className="my-4" />
          <div className="p-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
