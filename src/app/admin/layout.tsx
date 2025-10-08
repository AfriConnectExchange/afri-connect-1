
'use client';
import { useUser, useFirestore } from '@/firebase';
import { PageLoader } from '@/components/ui/loader';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, User as UserIcon, Shield, BarChart2, BookOpen, LayoutDashboard, Tag, Mail } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { id: 'user-management', label: 'User Management', href: '/admin/users', icon: UserIcon },
    { id: 'categories', label: 'Categories', href: '/admin/categories', icon: Tag },
    { id: 'content-moderation', label: 'Content Moderation', href: '/admin/content', icon: Shield },
    { id: 'analytics', label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart2 },
    { id: 'logs', label: 'System Logs', href: '/admin/logs', icon: BookOpen },
    { id: 'mail-preview', label: 'Email Preview', href: '/admin/mail-preview', icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
        if (!user || !firestore) return;
        try {
            const profileDoc = await getDoc(doc(firestore, "profiles", user.uid));
            if (profileDoc.exists()) {
                setProfile(profileDoc.data());
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    if(user) {
        fetchProfile();
    }
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || loadingProfile) {
    return <PageLoader />;
  }

  const canAccess = profile?.primary_role === 'admin';

  if (!canAccess) {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">
                    You do not have permission to access the admin dashboard.
                </p>
                <Button className="w-full" onClick={() => router.push('/')}>
                    Go to Marketplace
                </Button>
            </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6" />
              <span className="">Admin Portal</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map(item => (
                     <Link
                        key={item.id}
                        href={item.href}
                        className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "text-primary bg-muted"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>Back to Marketplace</Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
