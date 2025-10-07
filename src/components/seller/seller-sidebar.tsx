
'use client';

import Link from 'next/link';
import {
  Bell,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  BadgePercent,
  Megaphone,
  CreditCard,
  ChevronDown,
  Settings,
  Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '@/firebase';

export function SellerSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    {
      href: '/seller/sales',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/seller/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/seller/promotions',
      label: 'Promotions',
      icon: BadgePercent,
    },
    {
      href: '/seller/advertise',
      label: 'Advertising',
      icon: Megaphone,
    },
     {
      href: '/seller/reports',
      label: 'Reports',
      icon: LineChart,
    },
  ];

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/seller/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                 <span className="font-bold text-white text-sm">VC</span>
            </div>
            <span className="text-orange-500">VENDOR CENTER</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) =>(
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      pathname === item.href && 'bg-muted text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
              ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t space-y-4">
            <Link href="/seller/shop-settings" className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                 pathname === "/seller/shop-settings" && 'bg-orange-100 text-orange-600'
            )}>
                <Store className="h-4 w-4" />
                Shop Settings
            </Link>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                        <div className="font-semibold">Shoapa</div>
                        <div className="text-muted-foreground truncate max-w-[120px]">{user?.email}</div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4"/>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
