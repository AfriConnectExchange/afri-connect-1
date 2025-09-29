'use client';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { useRouter } from 'next/navigation';

export default function Analytics() {
  const router = useRouter();

  return <AnalyticsPage onNavigate={router.push} />;
}
