'use client';
import { CoursesPage } from '@/components/CoursesPage';
import { useRouter } from 'next/navigation';

export default function Courses() {
  const router = useRouter();

  return <CoursesPage onNavigate={router.push} />;
}
