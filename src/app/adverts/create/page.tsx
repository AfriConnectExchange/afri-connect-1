
'use client';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ListingForm } from '@/components/adverts/listing-form';
import { Package, TrendingUp, User as UserIcon } from 'lucide-react';

export default function CreateListingPage() {
  
  const navItems = [
    { id: 'adverts', label: 'My Listings', href: '/adverts', icon: Package },
    { id: 'sales', label: 'My Sales', href: '/sales', icon: TrendingUp },
    { id: 'profile', label: 'Marketplace Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <>
      <DashboardHeader title="Create Listing" navItems={navItems} />
      <ListingForm />
    </>
  );
}
