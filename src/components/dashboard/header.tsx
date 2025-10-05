
'use client';
import { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Bell,
  LogOut,
  Package,
  Settings,
  Handshake,
  TrendingUp,
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
import { motion } from 'framer-motion';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { HeaderSearchBar } from '../marketplace/header-search-bar';
import { doc, getDoc } from 'firebase/firestore';


interface HeaderProps {
    cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
        if (!user || !firestore) return;
        try {
          const profileDoc = await getDoc(doc(firestore, "profiles", user.uid));
          if (profileDoc.exists()) {
              setProfile(profileDoc.data());
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
    };
    
    if (user) {
        fetchProfile();
    } else {
        setProfile(null);
        setNotificationCount(0);
    }

  }, [user, firestore]);

  useEffect(() => {
    if (cartCount > 0) {
      setIsCartAnimating(true);
      const timer = setTimeout(() => setIsCartAnimating(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [cartCount]);
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  }
  
  const canAccessSellerFeatures = profile?.primary_role === 'seller' || profile?.primary_role === 'sme';

  const menuItems = {
      mobile: [
        { id: '/', label: 'Marketplace', href: '/', show: true, icon: ShoppingCart },
        { id: '/orders', label: 'My Orders', href: '/orders', show: true, icon: Package },
        { id: '/notifications', label: 'Notifications', href: '/notifications', show: true, icon: Bell },
        { id: '/profile', label: 'My Account', href: '/profile', show: true, icon: User },
      ],
      dropdown: [
        { id: '/profile', label: 'My Account', href: '/profile', show: true, icon: User },
        { id: '/orders', label: 'My Orders', href: '/orders', show: true, icon: Package },
        { id: '/barter', label: 'My Barter Proposals', href: '/barter', show: true, icon: Handshake },
        { id: '/notifications', label: 'Notifications', href: '/notifications', show: true, icon: Bell },
      ]
  }
  

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
                    href="/"
                    className="flex items-center gap-2"
                    onClick={handleMobileLinkClick}
                  >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">AE</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      AfriConnect Exchange
                    </span>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    {menuItems.mobile.filter(item => item.show).map((item) => (
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
                </div>

                <div className="border-t mt-4 pt-4">
                    {user ? (
                        <>
                          <Button
                              variant="ghost"
                              className="w-full justify-start text-destructive hover:text-destructive"
                              onClick={() => { handleLogout(); handleMobileLinkClick(); }}
                          >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                          </Button>
                        </>
                    ) : (
                         <Link href="/auth" passHref>
                            <Button
                                className="w-full justify-start"
                                onClick={handleMobileLinkClick}
                            >
                                <User className="w-4 h-4 mr-2" />
                                Sign In / Register
                            </Button>
                         </Link>
                    )}
                </div>

              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-1 lg:flex-none justify-center lg:justify-start min-w-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">AE</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-primary truncate">
                AfriConnect Exchange
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <HeaderSearchBar />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
             <div className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
               <Button asChild variant="outline" size="sm">
                <Link href="/seller">Sell on AfriConnect</Link>
              </Button>
            </div>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/cart" passHref>
                  <motion.div
                    animate={isCartAnimating ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9"
                      aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </Link>

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
                                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
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
                          {menuItems.dropdown.filter(item => item.show && item.icon).map((item) => (
                             <Link key={item.id} href={item.href}><DropdownMenuItem><item.icon className="mr-2 h-4 w-4" /><span>{item.label}</span></DropdownMenuItem></Link>
                          ))}
                           {canAccessSellerFeatures && (
                            <>
                              <DropdownMenuSeparator />
                              <Link href="/seller/sales"><DropdownMenuItem><TrendingUp className="mr-2 h-4 w-4" /><span>My Sales</span></DropdownMenuItem></Link>
                              <Link href="/seller/products"><DropdownMenuItem><Package className="mr-2 h-4 w-4" /><span>My Listings</span></DropdownMenuItem></Link>
                            </>
                           )}
                           <DropdownMenuSeparator />
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
            ) : (
                <div className="hidden md:flex">
                     <Link href="/auth" passHref>
                        <Button>Sign In</Button>
                     </Link>
                </div>
            )}
            
            <div className="flex md:hidden items-center gap-2">
                <Link href="/cart" passHref>
                  <motion.div
                      animate={isCartAnimating ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-9 w-9"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </Button>
                  </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
