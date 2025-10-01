
'use client';
import { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Settings,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  title: string;
  navItems: { id: string; label: string; href: string; icon: React.ElementType }[];
}

export function DashboardHeader({ title, navItems }: DashboardHeaderProps) {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };
    
    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if(session?.user) {
        fetchUserAndProfile();
      } else {
        setProfile(null);
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  }

  const notificationCount = 2; // Mock

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-background/80 sticky top-0 z-50 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <Link
                    href="/marketplace"
                    className="flex items-center gap-2"
                    onClick={handleMobileLinkClick}
                  >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">AE</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      AfriConnect
                    </span>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link key={item.id} href={item.href} passHref>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className="w-full justify-start text-base py-6"
                          onClick={handleMobileLinkClick}
                        >
                          {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                   <div className="border-t my-4"></div>
                     <Link href="/marketplace" passHref>
                        <Button
                          variant={'ghost'}
                          className="w-full justify-start text-base py-6"
                          onClick={handleMobileLinkClick}
                        >
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          Back to Marketplace
                        </Button>
                      </Link>
                </div>

                <div className="border-t mt-4 pt-4">
                    {user && (
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-destructive hover:text-destructive"
                            onClick={() => { handleLogout(); handleMobileLinkClick(); }}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    )}
                </div>

              </div>
            </SheetContent>
          </Sheet>

          {/* Logo & Title */}
          <div className="flex items-center gap-4 cursor-pointer flex-1 lg:flex-none justify-center lg:justify-start min-w-0">
            <Link href="/marketplace" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">AE</span>
              </div>
            </Link>
            <h1 className="text-lg lg:text-xl font-bold text-foreground truncate">{title}</h1>
          </div>


          {/* Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
                <Link href="/marketplace">Marketplace</Link>
            </Button>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                 <Link href="/notifications" passHref>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                  >
                    <Bell className="w-5 h-5" />
                     {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {notificationCount}
                        </span>
                     )}
                  </Button>
                </Link>
                
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email} />
                                <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{profile?.full_name || user.email}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                           <Link href="/profile"><DropdownMenuItem><User className="mr-2 h-4 w-4" /><span>Profile</span></DropdownMenuItem></Link>
                           <Link href="/profile?tab=settings"><DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem></Link>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
