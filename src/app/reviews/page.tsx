'use client';
import { ReviewsPage } from '@/components/ReviewsPage';
import { useRouter } from 'next/navigation';

export default function Reviews() {
  const router = useRouter();

  return <ReviewsPage onNavigate={router.push} />;
}
