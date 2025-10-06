
"use client";

import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics', { method: 'POST' });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
      <div className="grid gap-4">
        <div className="p-4 border rounded">Total Users: {data?.totalUsers ?? 'N/A'}</div>
        <div className="p-4 border rounded">Total Products: {data?.totalProducts ?? 'N/A'}</div>
        <div className="p-4 border rounded">Total Sales: {data?.totalSales ?? 'N/A'}</div>
      </div>
    </div>
  );
}
