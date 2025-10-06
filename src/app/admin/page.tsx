
'use client';

import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { PageLoader } from '@/components/ui/loader';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          setAnalytics(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return <AdminDashboard analytics={analytics} />;
}
