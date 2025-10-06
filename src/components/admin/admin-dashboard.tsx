
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Shield, BarChart2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

function KPICard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function KPICardSkeleton() {
    return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </CardContent>
        </Card>
    )
}

export function AdminDashboard({ analytics }: { analytics: any }) {
  const kpiData = [
    { title: 'Total Users', value: analytics?.totalUsers ?? 'N/A', icon: Users, description: 'All registered users' },
    { title: 'Active Listings', value: analytics?.totalProducts ?? 'N/A', icon: Package, description: 'Currently active products' },
    { title: 'Total Sales', value: analytics?.totalSales ?? 'N/A', icon: BarChart2, description: 'All completed orders' },
    { title: 'Open Disputes', value: analytics?.openDisputes ?? 'N/A', icon: Shield, description: 'Needs attention' },
  ];

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>
          Overview and management tools for the platform.
        </CardDescription>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analytics ? kpiData.map(kpi => <KPICard key={kpi.title} {...kpi} />) : Array.from({length: 4}).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Management Sections</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>User Management</p>
              <p>Content Moderation</p>
              <p>Financial Management</p>
          </CardContent>
        </Card>
    </div>
  );
}
